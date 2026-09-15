const Tesseract = require('tesseract.js');
const ExamCenter = require('../models/ExamCenter');
const User = require('../models/User');
const { AppError, catchAsync } = require('../utils/errorUtils');
const logger = require('../utils/logger');
const BLOCKED_WORDS = [
  'FEDERAL', 'BOARD', 'EDUCATION', 'ISLAMABAD', 'PAKISTAN', 'PROVISIONAL',
  'ANNUAL', 'EXAMINATION', 'ROLL', 'NUMBER', 'SLIP', 'DATE', 'SHEET',
  'INTERMEDIATE', 'SECONDARY', 'REG', 'ID', 'NO', 'NAME', 'SYSTEM', 'PAK',
  'TION', 'CENTRE', 'ALLOTED', 'THEORY', 'PAPER', 'COMPULSORY',
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

const CENTER_PATTERNS = [

  {
    name: 'CENTRE_ALLOTED',
    boards: ['FBISE', 'Federal Board'],
    regex: /CENTRE\s*ALLOTED\s*:?\s*\(?\s*(\d{3,10})\s*\)?\s*([A-Za-z0-9\s,.\-()&]+)/i,
    extract: (match) => ({
      code: match[1],
      name: match[2].trim(),
    }),
  },

  {
    name: 'EXAMINATION_CENTRE',
    boards: ['Punjab Board', 'Sindh Board'],
    regex: /(?:EXAMINATION|EXAM)\s*(?:CENTRE|CENTER)\s*:?\s*([A-Za-z0-9\s,.\-()&]+?)\s*\(?\s*(\d{3,10})\s*\)?/i,
    extract: (match) => ({
      name: match[1].trim(),
      code: match[2],
    }),
  },

  {
    name: 'CENTRE_NAME',
    boards: ['All'],
    regex: /(?:CENTRE|CENTER)\s*(?:NAME|CODE)?\s*:?\s*([A-Za-z0-9\s,.\-()&]+?)(?:\n|$)/i,
    extract: (match) => ({
      name: match[1].trim(),
      code: null,
    }),
  },

  {
    name: 'VENUE',
    boards: ['All'],
    regex: /VENUE\s*:?\s*([A-Za-z0-9\s,.\-()&]+?)(?:\n|$)/i,
    extract: (match) => ({
      name: match[1].trim(),
      code: null,
    }),
  },

  {
    name: 'CENTER_OF_EXAM',
    boards: ['Sindh Board', 'Karachi Board'],
    regex: /CENTER\s*OF\s*EXAMINATION\s*:?\s*([A-Za-z0-9\s,.\-()&]+?)(?:\n|$)/i,
    extract: (match) => ({
      name: match[1].trim(),
      code: null,
    }),
  },

  {
    name: 'ADDRESS_OF_CENTER',
    boards: ['All'],
    regex: /ADDRESS\s*OF\s*(?:CENTER|CENTRE|EXAMINATION)\s*:?\s*([A-Za-z0-9\s,.\-()&]+?)(?:\n|$)/i,
    extract: (match) => ({
      name: match[1].trim(),
      code: null,
    }),
  },


  {
    name: 'CENTER_GENERIC',
    boards: ['All'],
    regex: /(?:CENTER|CENTRE)\s*:?\s*([A-Za-z0-9\s,.\-()&]{5,100}?)\s*\(?\s*(\d{3,10})\s*\)?/i,
    extract: (match) => ({
      name: match[1].trim(),
      code: match[2],
    }),
  },
];


const isValidCenterCode = (code) => {
  return /^[A-Z0-9]{3,10}$/.test(code) && !BLOCKED_WORDS.includes(code);
};

const escapeRegex = (str) => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const cleanCenterName = (name) => {
  if (!name) return '';

  return name
    .replace(/\s+/g, ' ')                     
    .replace(/\s*THEORY\s*PAPER.*$/i, '')      
    .replace(/\s*COMPULSORY.*$/i, '')          
    .replace(/\s*PRACTICAL.*$/i, '')          
    .replace(/\s*\(FA\).*$/i, '')             
    .replace(/\s*\(\d+\).*$/i, '')             
    .replace(/[^\w\s,.\-()&]/g, '')            
    .trim();
};


const detectBoard = (text) => {
  const upper = text.toUpperCase();

  if (upper.includes('FEDERAL BOARD') || upper.includes('FBISE')) {
    return 'Federal Board';
  }
  if (upper.includes('PUNJAB')) return 'Punjab Board';
  if (upper.includes('SINDH') || upper.includes('KARACHI')) return 'Sindh Board';
  if (upper.includes('KPK') || upper.includes('PESHAWAR')) return 'KPK Board';
  if (upper.includes('BALOCHISTAN') || upper.includes('QUETTA')) return 'Balochistan Board';
  if (upper.includes('AJK') || upper.includes('AZAD')) return 'AJK Board';

  return 'Other';
};


const extractCenter = (text) => {
  const cleanText = text
    .replace(/[^A-Za-z0-9\n\r\s:;,().&\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const detectedBoard = detectBoard(text);
  logger.debug(`Detected board: ${detectedBoard}`);
  for (const pattern of CENTER_PATTERNS) {
    const match = cleanText.match(pattern.regex);

    if (match) {
      const extracted = pattern.extract(match);
      const cleanedName = cleanCenterName(extracted.name);

      if (cleanedName.length >= 5) {
        logger.info(`Matched pattern: ${pattern.name} (${pattern.boards.join(', ')})`);
        logger.info(`Center Code: ${extracted.code || 'N/A'}`);
        logger.info(`Center Name: ${cleanedName}`);

        return {
          code: extracted.code,
          name: cleanedName,
          matchedPattern: pattern.name,
          detectedBoard,
        };
      }
    }
  }

  const keywords = [
    'school', 'college', 'academy', 'institute', 'campus',
    'university', 'model town', 'high school', 'higher secondary',
  ];

  const lines = cleanText.split('\n');
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    if (
      keywords.some((k) => lowerLine.includes(k)) &&
      line.length > 15 &&
      line.length < 150
    ) {
      const cleaned = cleanCenterName(line);
      if (cleaned.length >= 5) {
        logger.info(`Matched by keyword: ${cleaned}`);
        return {
          code: null,
          name: cleaned,
          matchedPattern: 'KEYWORD_FALLBACK',
          detectedBoard,
        };
      }
    }
  }

  return {
    code: null,
    name: null,
    matchedPattern: null,
    detectedBoard,
  };
};


const buildCenterResponse = (center, extras = {}) => ({
  _id: center._id,
  centerCode: center.centerCode,
  name: center.name,
  address: center.address,
  city: center.city,
  state: center.state || '',
  country: center.country || 'Pakistan',
  latitude: center.latitude,
  longitude: center.longitude,
  capacity: center.capacity || 0,
  totalStudents: center.totalStudents || 0,
  contactNumber: center.contactNumber || '',
  contactEmail: center.contactEmail || '',
  facilities: center.facilities || [],
  isVerified: center.isVerified || false,
  ...extras,
});



const findCenterInDB = async (extracted) => {
  const { code, name } = extracted;


  if (code) {
    let center = await ExamCenter.findOne({
      centerCode: code,
      isActive: true,
      deletedAt: null,
    }).populate('boardOfficial', 'name email phone');

    if (center) {
      logger.info(`Matched by exact code: ${code}`);
      return center;
    }

    center = await ExamCenter.findOne({
      centerCode: { $regex: `^${escapeRegex(code)}$|${escapeRegex(code)}$`, $options: 'i' },
      isActive: true,
      deletedAt: null,
    }).populate('boardOfficial', 'name email phone');

    if (center) {
      logger.info(`Matched by code suffix: ${code}`);
      return center;
    }
  }


  if (name) {
    const words = name.split(' ').filter((w) => w.length > 2);
    const searchPhrase = words.slice(0, 5).join(' ');

    let center = await ExamCenter.findOne({
      $or: [
        { name: { $regex: escapeRegex(name), $options: 'i' } },
        { name: { $regex: escapeRegex(searchPhrase), $options: 'i' } },
        { address: { $regex: escapeRegex(searchPhrase), $options: 'i' } },
      ],
      isActive: true,
      deletedAt: null,
    }).populate('boardOfficial', 'name email phone');

    if (center) {
      logger.info(`Matched by name: ${searchPhrase}`);
      return center;
    }

    const shortPhrase = words.slice(0, 3).join(' ');
    if (shortPhrase.length > 5 && shortPhrase !== searchPhrase) {
      center = await ExamCenter.findOne({
        $or: [
          { name: { $regex: escapeRegex(shortPhrase), $options: 'i' } },
          { address: { $regex: escapeRegex(shortPhrase), $options: 'i' } },
        ],
        isActive: true,
        deletedAt: null,
      }).populate('boardOfficial', 'name email phone');

      if (center) {
        logger.info(`Matched by short name: ${shortPhrase}`);
        return center;
      }
    }
  }

  return null;
};


const extractCenterCodeOCR = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload an image of your roll number slip', 400);
  }

  if (req.file.size > 5 * 1024 * 1024) {
    throw new AppError('Image size exceeds 5MB limit.', 400);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    throw new AppError('Invalid file type. Please upload JPEG, PNG, or WebP.', 400);
  }

  logger.info(`OCR request for: ${req.user.email}, file: ${req.file.originalname}`);

  const imageBase64 = req.file.buffer.toString('base64');
  const imageData = `data:${req.file.mimetype};base64,${imageBase64}`;

  let extractedText = '';
  let confidence = 0;
  let extracted = null;
  let center = null;

  try {
    const result = await Tesseract.recognize(
      imageData,
      OCR_CONFIG.lang,
      { ...OCR_CONFIG.options, logger: OCR_CONFIG.logger }
    );
    extractedText = result.data.text;
    confidence = result.data.confidence || 0;
    logger.debug(`OCR Text (first 500 chars): ${extractedText.substring(0, 500)}`);
    extracted = extractCenter(extractedText);
    if (extracted && (extracted.code || extracted.name)) {
      center = await findCenterInDB(extracted);
    }
    if (!center) {
      logger.info('Pattern match failed, trying roll number prefix...');
      const rollNumberMatch = extractedText.match(/Roll\s*No\s*[:;]?\s*(\d+)/i);
      if (rollNumberMatch) {
        const possibleCodes = extractedText.match(/\b(\d{3,6})\b/g) || [];

        for (const code of possibleCodes) {
          center = await ExamCenter.findOne({
            centerCode: { $regex: `^${escapeRegex(code)}$|${escapeRegex(code)}$`, $options: 'i' },
            isActive: true,
            deletedAt: null,
          }).populate('boardOfficial', 'name email phone');

          if (center) {
            logger.info(`Matched by numeric code from slip: ${code}`);
            break;
          }
        }
      }
    }
  } catch (ocrError) {
    logger.error('OCR Processing Error:', ocrError);
    throw new AppError('Failed to process image. Please try again or use manual entry.', 500);
  }

  if (!center) {
    return res.status(404).json({
      success: false,
      message: 'Center not found in database. Please enter manually.',
      detectedBoard: extracted?.detectedBoard || 'Unknown',
      extracted: {
        code: extracted?.code || null,
        name: extracted?.name || null,
        matchedPattern: extracted?.matchedPattern || null,
      },
      extractedText: extractedText.substring(0, 300),
      confidence: Math.round(confidence),
    });
  }

  logger.info(`OCR successful for: ${req.user.email}, center: ${center.centerCode}`);

  res.status(200).json({
    success: true,
    centerCode: center.centerCode,
    detectedBoard: extracted?.detectedBoard || 'Unknown',
    center: buildCenterResponse(center, {
      boardOfficial: center.boardOfficial
        ? {
            name: center.boardOfficial.name,
            email: center.boardOfficial.email,
            phone: center.boardOfficial.phone,
          }
        : null,
    }),
    extracted: {
      code: extracted?.code || null,
      name: extracted?.name || null,
      matchedPattern: extracted?.matchedPattern || null,
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
    throw new AppError(
      'Invalid center code format. Code must be 3-10 alphanumeric characters.',
      400
    );
  }

  let center = await ExamCenter.findOne({
    centerCode: code,
    isActive: true,
    deletedAt: null,
  }).populate('boardOfficial', 'name email phone');
  if (!center) {
    center = await ExamCenter.findOne({
      centerCode: { $regex: `${escapeRegex(code)}$`, $options: 'i' },
      isActive: true,
      deletedAt: null,
    }).populate('boardOfficial', 'name email phone');
  }

  if (!center) {
    throw new AppError('Center not found with this code', 404);
  }

  logger.info(`Manual search: ${req.user.email} searched: ${center.centerCode}`);

  res.status(200).json({
    success: true,
    center: buildCenterResponse(center, {
      boardOfficial: center.boardOfficial
        ? {
            name: center.boardOfficial.name,
            email: center.boardOfficial.email,
            phone: center.boardOfficial.phone,
          }
        : null,
    }),
  });
});


const getCentersList = catchAsync(async (req, res) => {
  const { search = '', city = '', page = 1, limit = 50 } = req.query;

  const query = { isActive: true, deletedAt: null };

  if (search) {
    const safeSearch = escapeRegex(search);
    query.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { centerCode: { $regex: safeSearch, $options: 'i' } },
      { city: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (city) {
    query.city = { $regex: escapeRegex(city), $options: 'i' };
  }

  const [centers, total] = await Promise.all([
    ExamCenter.find(query)
      .select('centerCode name address city latitude longitude totalStudents capacity')
      .sort({ city: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(),
    ExamCenter.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: centers.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    centers,
  });
});


const getCities = catchAsync(async (req, res) => {
  const cities = await ExamCenter.aggregate([
    {
      $match: {
        isActive: true,
        deletedAt: null,
        city: { $ne: '', $exists: true },
      },
    },
    {
      $group: {
        _id: '$city',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        city: '$_id',
        centerCount: '$count',
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: cities.length,
    cities,
  });
});


const getCenterById = catchAsync(async (req, res) => {
  const center = await ExamCenter.findById(req.params.id)
    .populate('boardOfficial', 'name email phone')
    .select('-createdBy -updatedBy -metadata');

  if (!center || center.deletedAt || !center.isActive) {
    throw new AppError('Center not found', 404);
  }

  res.status(200).json({
    success: true,
    center: buildCenterResponse(center, {
      boardOfficial: center.boardOfficial
        ? {
            name: center.boardOfficial.name,
            email: center.boardOfficial.email,
            phone: center.boardOfficial.phone,
          }
        : null,
    }),
  });
});


const getNearbyCenters = catchAsync(async (req, res) => {
  const { lat, lng, maxDistance = 50, limit = 10 } = req.query;

  if (!lat || !lng) {
    throw new AppError('Please provide lat and lng', 400);
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const maxDistInMeters = parseFloat(maxDistance) * 1000;

  const centers = await ExamCenter.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        distanceField: 'distance',
        maxDistance: maxDistInMeters,
        spherical: true,
        query: {
          isActive: true,
          deletedAt: null,
        },
      },
    },
    { $limit: parseInt(limit) },
    {
      $project: {
        centerCode: 1,
        name: 1,
        address: 1,
        city: 1,
        latitude: 1,
        longitude: 1,
        capacity: 1,
        totalStudents: 1,
        distance: { $divide: ['$distance', 1000] },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    count: centers.length,
    centers,
  });
});


module.exports = {
  extractCenterCode: extractCenterCodeOCR,
  manualCenterSearch,
  getCentersList,
  getCities,
  getCenterById,
  getNearbyCenters,
};