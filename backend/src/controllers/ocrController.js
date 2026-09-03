
const Tesseract = require('tesseract.js');
const ExamCenter = require('../models/ExamCenter');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');


const BLOCKED_WORDS = [
  'FEDERAL', 'BOARD', 'EDUCATION', 'ISLAMABAD', 'PAKISTAN', 'PROVISIONAL',
  'ANNUAL', 'EXAMINATION', 'ROLL', 'NUMBER', 'SLIP', 'DATE', 'SHEET',
  'INTERMEDIATE', 'SECONDARY', 'REG', 'ID', 'NO', 'NAME', 'SYSTEM', 'PAK',
  'TION', 'TION2023', 'ANNUAL2023', 'CENTRE', 'ALLOTED'
];

const OCR_CONFIG = {
  lang: 'eng+urd',
  options: {
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    tessedit_pageseg_mode: 6,
  },
  logger: (m) => {
    if (m.status === 'recognizing text') {
      logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
    }
  },
};



const isValidCenterCode = (code) => {
  return /^[A-Z0-9]{3,10}$/.test(code) && !BLOCKED_WORDS.includes(code);
};

const extractCenterNameOrAddress = (text) => {
  const cleanText = text
    .replace(/[^A-Za-z0-9\n\r\s:;,().-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const centreAllotedPattern = /CENTRE\s*ALLOTED\s*:?\s*\(?([A-Za-z0-9\s,.-]+?)\)?\s*\(?/i;
  const centreMatch = cleanText.match(centreAllotedPattern);
  if (centreMatch && centreMatch[1]) {
    let centreName = centreMatch[1].trim();
    if (centreName.length > 10) {
      return centreName;
    }
  }

  const addressPatterns = [
    /Address\s*:\s*([A-Za-z0-9\s,.-]+)/i,
    /Center\s*:\s*([A-Za-z0-9\s,.-]+)/i,
    /Venue\s*:\s*([A-Za-z0-9\s,.-]+)/i,
  ];

  for (const pattern of addressPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      let extracted = match[1].trim();
      if (extracted.length > 50) {
        extracted = extracted.split('\n')[0].trim();
      }
      return extracted;
    }
  }

  const keywords = ['school', 'college', 'academy', 'institute', 'campus', 'university', 'model town', 'high school'];
  const lines = cleanText.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (keywords.some(k => lowerLine.includes(k))) {
      return line.trim();
    }
  }

  return null;
};


const extractCenterCodeOCR = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image of your roll number slip', 400);
  }

  if (req.file.size > 5 * 1024 * 1024) {
    throw new AppError('Image size exceeds 5MB limit. Please upload a smaller image.', 400);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new AppError('Invalid file type. Please upload JPEG, PNG, or WebP image.', 400);
  }

  logger.info(`OCR request for: ${req.user.email}, file: ${req.file.originalname}`);

  const imageBase64 = req.file.buffer.toString('base64');
  const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

  let extractedText = '';
  let centerCode = null;
  let centerNameOrAddress = null;
  let confidence = 0;

  try {
    const result = await Tesseract.recognize(
      imageData,
      OCR_CONFIG.lang,
      { ...OCR_CONFIG.options, logger: OCR_CONFIG.logger }
    );

    extractedText = result.data.text;
    confidence = result.data.confidence || 0;

    logger.debug(`Extracted Text: ${extractedText.substring(0, 700)}`);

    centerNameOrAddress = extractCenterNameOrAddress(extractedText);

    if (centerNameOrAddress) {
      logger.info(`Extracted Center Name/Address: ${centerNameOrAddress}`);
      const cleanName = centerNameOrAddress.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim();
      const centerByName = await ExamCenter.findOne({
        $or: [
          { name: { $regex: cleanName, $options: 'i' } },
          { address: { $regex: cleanName, $options: 'i' } },
          { name: { $regex: cleanName.split(' ').slice(0, 4).join(' '), $options: 'i' } },
        ],
        isActive: true
      });

      if (centerByName) {
        centerCode = centerByName.centerCode;
        logger.info(`Center matched by Name/Address: ${centerByName.name} (${centerCode})`);
      }
    }

    if (!centerCode) {
      const centerAllotedMatch = extractedText.match(/CENTRE\s*ALLOTED\s*:?\s*\(?\s*(\d{3,5})\s*\)?/i);
      if (centerAllotedMatch) {
        const codeFromSlip = centerAllotedMatch[1];
        const centerByCode = await ExamCenter.findOne({ centerCode: codeFromSlip, isActive: true });
        if (centerByCode) {
          centerCode = centerByCode.centerCode;
          logger.info(`Center matched by Alloted Code: ${centerByCode.centerCode}`);
        }
      }
    }

    if (!centerCode) {
      const rollNumberPatterns = [
        /Roll\s*No\s*[:;]?\s*([A-Z0-9\-]+)/i,
        /Registration\s*No\s*[:;]?\s*([A-Z0-9\-]+)/i,
      ];

      for (const pattern of rollNumberPatterns) {
        const match = extractedText.match(pattern);
        if (match) {
          const rollNumber = match[1].trim();
          const prefix = rollNumber.substring(0, 4);

          const center = await ExamCenter.findOne({
            centerCode: { $regex: `^${prefix}`, $options: 'i' },
            isActive: true,
          });

          if (center) {
            centerCode = center.centerCode;
            break;
          }
        }
      }
    }

  } catch (ocrError) {
    logger.error('OCR Processing Error:', ocrError);
    throw new AppError('Failed to process image. Please try again or use manual entry.', 500);
  }

  // Final check
  if (centerCode && BLOCKED_WORDS.includes(centerCode)) {
    centerCode = null;
  }

  if (!centerCode) {
    return res.status(404).json({
      success: false,
      message: 'Center not found in database. Please enter manually.',
      extractedText: extractedText.substring(0, 200),
      centerNameOrAddress,
      confidence: Math.round(confidence),
    });
  }

  if (!isValidCenterCode(centerCode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid center code format detected. Please enter manually.',
      extractedText: extractedText.substring(0, 200),
      centerCode,
    });
  }

  const center = await ExamCenter.findOne({ centerCode, isActive: true });

  if (!center) {
    return res.status(404).json({
      success: false,
      message: 'Center not found in database. Please enter manually.',
      centerCode,
      extractedText: extractedText.substring(0, 200),
    });
  }

  logger.info(`OCR successful for: ${req.user.email}, center: ${center.centerCode}`);

  res.status(200).json({
    success: true,
    centerCode,
    center: {
      _id: center._id,
      centerCode: center.centerCode,
      name: center.name,
      address: center.address,
      city: center.city,
      latitude: center.latitude,
      longitude: center.longitude,
      capacity: center.capacity,
      contactNumber: center.contactNumber,
      contactEmail: center.contactEmail,
    },
    extractedText: extractedText.substring(0, 300),
    confidence: Math.round(confidence),
  });
});


const manualCenterSearch = catchAsync(async (req, res) => {
  const { centerCode } = req.body;

  if (!centerCode) {
    throw new AppError('Please provide a center code', 400);
  }

  const code = String(centerCode).trim().toUpperCase();

  if (!isValidCenterCode(code)) {
    throw new AppError('Invalid center code format. Code must be 3-10 alphanumeric characters.', 400);
  }

  const center = await ExamCenter.findOne({
    centerCode: code,
    isActive: true,
  });

  if (!center) {
    throw new AppError('Center not found with this code', 404);
  }

  logger.info(`Manual search: ${req.user.email} searched for center: ${center.centerCode}`);

  res.status(200).json({
    success: true,
    center: {
      _id: center._id,
      centerCode: center.centerCode,
      name: center.name,
      address: center.address,
      city: center.city,
      latitude: center.latitude,
      longitude: center.longitude,
      capacity: center.capacity,
      contactNumber: center.contactNumber,
      contactEmail: center.contactEmail,
    },
  });
});

const getCentersList = catchAsync(async (req, res) => {
  const { search = '', city = '', limit = 50 } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { centerCode: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  const centers = await ExamCenter.find(query)
    .select('centerCode name address city latitude longitude')
    .sort({ city: 1, name: 1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    success: true,
    count: centers.length,
    centers,
  });
});

const getCities = catchAsync(async (req, res) => {
  const cities = await ExamCenter.distinct('city', {
    isActive: true,
  });

  res.status(200).json({
    success: true,
    cities: cities.sort(),
  });
});

module.exports = {
  extractCenterCode: extractCenterCodeOCR,
  manualCenterSearch,
  getCentersList,
  getCities,
};