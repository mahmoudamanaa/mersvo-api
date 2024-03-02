const multer = require("multer");
const AppError = require("../utils/appError");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/usersPhotos");
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];

    cb(
      null,
      `user-${req.body.first_name}-${
        req.body.last_name
      }-${Date.now()}.${extension}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload.single("photo");
