const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

exports.createUser = catchAsync(async (req, res, next) => {
  const { first_name, last_name, email, password, role } = req.body;

  const newUser = await User.create({
    first_name,
    last_name,
    email,
    password,
    role,
    photo: `${process.env.API_URL}/api/v1/public/usersPhotos/${req.file.filename}`,
  });

  newUser.password = undefined;

  res.status(201).json({ status: "success", data: { user: newUser } });
});

exports.getUsers = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil((await User.find()).length / limit);

  const users = await User.find().skip(skip).limit(limit);

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
    metadata: { page, totalPages },
  });
});

exports.editUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  let updatedUser;

  if (req.file) {
    const user = await User.findById(userId);
    const fileName = user.photo.split("/")[user.photo.split("/").length - 1];
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "usersPhotos",
      fileName
    );

    fs.unlinkSync(filePath);

    updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        photo: `${process.env.API_URL}/api/v1/public/usersPhotos/${req.file.filename}`,
      },
      { new: true, runValidators: true }
    );
  } else {
    updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );
  }

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  const fileName = user.photo.split("/")[user.photo.split("/").length - 1];
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "usersPhotos",
    fileName
  );

  fs.unlinkSync(filePath);

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    status: "success",
    data: { message: "User has been deleted successfully!" },
  });
});
