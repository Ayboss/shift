const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadXlsFile = upload.single("file");

exports.uploadProfileImage = upload.single("profileimage");
