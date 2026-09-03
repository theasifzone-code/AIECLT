
const sharp = require('sharp');

const preprocessImage = async (imageBuffer) => {
  try {
    const processed = await sharp(imageBuffer)
      .resize(1200, null, { 
        withoutEnlargement: true,
        fit: 'inside',
      })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
    
    return processed;
  } catch (error) {
    console.error('Image preprocessing error:', error);
    return imageBuffer; 
  }
};


const extractTextFromImage = async (imageBuffer, options = {}) => {
  const Tesseract = require('tesseract.js');
  
  const defaultOptions = {
    lang: 'eng+urd',
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:;.- ',
    tessedit_pageseg_mode: 6,
  };

  const config = { ...defaultOptions, ...options };

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