// src/utils/ocrUtils.js - ✅ OCR Utilities
const sharp = require('sharp');

/**
 * Preprocess image for better OCR results
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Buffer>} - Processed image buffer
 */
const preprocessImage = async (imageBuffer) => {
  try {
    // Resize, enhance contrast, convert to grayscale
    const processed = await sharp(imageBuffer)
      .resize(1200, null, { // Resize width to 1200px
        withoutEnlargement: true,
        fit: 'inside',
      })
      .grayscale()
      .normalize() // Enhance contrast
      .sharpen()
      .toBuffer();
    
    return processed;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    return imageBuffer; // Return original on error
  }
};

/**
 * Extract text from image using Tesseract
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} options - OCR options
 * @returns {Promise<Object>} - OCR result
 */
const extractTextFromImage = async (imageBuffer, options = {}) => {
  const Tesseract = require('tesseract.js');
  
  const defaultOptions = {
    lang: 'eng+urd',
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:;.- ',
    tessedit_pageseg_mode: 6,
  };

  const config = { ...defaultOptions, ...options };

  // Preprocess image
  const processedImage = await preprocessImage(imageBuffer);
  const imageBase64 = processedImage.toString('base64');
  const imageData = `data:image/jpeg;base64,${imageBase64}`;

  const result = await Tesseract.recognize(
    imageData,
    config.lang,
    {
      ...config,
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Optional progress logging
        }
      },
    }
  );

  return {
    text: result.data.text,
    confidence: result.data.confidence,
    words: result.data.words,
  };
};

module.exports = {
  preprocessImage,
  extractTextFromImage,
};