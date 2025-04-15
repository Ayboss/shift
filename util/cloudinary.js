const logger = require("./logger");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

exports.storeImageInCLoud = async (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  let dataURI = "data:" + file.mimetype + ";base64," + b64;
  const uploadResult = await cloudinary.uploader.upload(dataURI, {
    transformation: [{ fetch_format: "auto", quality: "auto" }],
  });
  return uploadResult.url;
};
