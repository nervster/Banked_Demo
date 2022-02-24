const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: "dz9b5logv",
    api_key: "387565848691498",
    api_secret: "sJRehwg01inAT2WW-6EYknwfC0g"
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'PiggyBank',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}