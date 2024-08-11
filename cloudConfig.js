const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'findastay_DEV', // Folder in Cloudinary where images will be stored
        allowedFormats: ["png", "jpg", "jpeg"], // Allowed formats
    },
});

module.exports = {
    cloudinary,
    storage
};
