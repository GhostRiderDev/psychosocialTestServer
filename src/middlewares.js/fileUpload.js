const multer = require('multer');
const path = require('path');
const createError = require('http-errors');

const UPLOAD_DIR = process.env.UPLOAD_FOLDER || "public/images/users";
const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5242880; // 5 MB
const ALLOWED_FILE_TYPES = process.env.ALLOWED_FILE_TYPES || ["jpg", "jpeg", "png"];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
        const extName = path.extname(file.originalname);
        cb(null, Date.now() + "-" + file.originalname.replace(extName, '') + extName);
    }
});

const fileFilter = (req, file, cb) => {
    const extName = path.extname(file.originalname).toLowerCase(); // Convert to lower case for case-insensitive comparison
    const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName.substring(1));
    if (!isAllowedFileType) {
        return cb(createError(new Error('File type not supported')));
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE }, // Set max file size limit
    fileFilter: fileFilter,
});

module.exports = upload;
