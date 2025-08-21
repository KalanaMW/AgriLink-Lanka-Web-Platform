let cachedCloudinary = null;

function getCloudinaryOrThrow() {
  if (cachedCloudinary) return cachedCloudinary;
  try {
    // Lazy-require so server can boot without cloudinary installed
    const cloud = require('cloudinary').v2;
    cachedCloudinary = cloud;
    return cachedCloudinary;
  } catch (err) {
    throw new Error('Cloudinary SDK not installed. Run: npm install cloudinary');
  }
}

function configureCloudinary() {
  const cloudinary = getCloudinaryOrThrow();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function uploadBase64Image(base64Data, folder) {
  const cloudinary = getCloudinaryOrThrow();
  if (!base64Data) {
    throw new Error('No image data provided');
  }
  const options = {
    folder: folder || process.env.CLOUDINARY_UPLOAD_FOLDER || 'agrilink/uploads',
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  };
  const result = await cloudinary.uploader.upload(base64Data, options);
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

module.exports = {
  configureCloudinary,
  uploadBase64Image,
};


