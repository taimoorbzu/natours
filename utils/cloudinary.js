const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;

// exports.uploads = async (file, folder) => {
//     try {
//         const result = await cloudinay.uploader.upload(file, {
//             folder
//         });
//         return result;
//     } catch (error) {
//         console.log(error);
//     }
// };
