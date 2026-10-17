const multer = require('multer');
const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Not an image! Please upload only images."), false);
    }
}

const upload = multer({
    storage,
    fileFilter: filter
})

module.exports = upload;