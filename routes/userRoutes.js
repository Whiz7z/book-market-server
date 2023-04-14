import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";
import asyncHandler from "express-async-handler";
import { admin, protectRoute } from "../middleware/authMiddleware.js";

import jwt from "jsonwebtoken";
const userRoutes = express.Router();

const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "60d" });
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPasswords(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      isAdmin: user.isAdmin,
      token: genToken(user._id),
      createdAt: user.createdAt,
    });
  } else {
    res.status(401).send("Invalid Email or Password");
    throw new Error("User not found.");
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send("We already have an account with that email address.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      isAdmin: user.isAdmin,
      token: genToken(user._id),
      createdAt: user.createdAt,
    });
  } else {
    res.status(400).send("We could not register you.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

const getAdmin = asyncHandler(async (req, res) => {
  res.json("goood");
});

const changeInfo = asyncHandler(async (req, res) => {
  console.log(req.user);

  const userToChange = await User.findById(req.user._id);
  console.log("token", genToken(req.user._id));
  if (userToChange) {
    userToChange.name = req.body.name;
    userToChange.surname = req.body.surname;
    userToChange.email = req.body.email;

    const updatedUser = await userToChange.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: genToken(updatedUser._id),
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  console.log(req.user);

  const userToChange = await User.findById(req.user._id);

  if (await userToChange.matchPasswords(req.body.currentPassword)) {
    userToChange.password = req.body.newPassword;
    const updatedUser = await userToChange.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: genToken(updatedUser._id),
      createdAt: updatedUser.createdAt,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  console.log(req.body);

  if (req.body) {
    const message = await Message.create({
      email: req.body.email,
      message: req.body.message,
    });

    console.log(message);
    res.json(message);
  } else {
    res.status(404);
    throw new Error("Could not send the message");
  }
});

userRoutes.route("/login").post(loginUser);
userRoutes.route("/register").post(registerUser);
userRoutes.route("/admin").get(protectRoute, admin, getAdmin);
userRoutes.route("/changeinfo").put(protectRoute, changeInfo);
userRoutes.route("/changepassword").put(protectRoute, changePassword);
userRoutes.route("/sendContactMessage").post(sendMessage);

export default userRoutes;
