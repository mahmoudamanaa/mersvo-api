const express = require("express");
const usersControllers = require("../controllers/usersControllers");
const upload = require("../middlewares/uploadPhoto");

const router = express.Router();

router.post("/", upload, usersControllers.createUser);

router.get("/", usersControllers.getUsers);

router.patch("/:userId", upload, usersControllers.editUser);

router.delete("/:userId", usersControllers.deleteUser);

module.exports = router;
