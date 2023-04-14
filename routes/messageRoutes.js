import Message from "../models/Message.js";
import express from "express";
import asyncHandler from "express-async-handler";
import { admin, protectRoute } from "../middleware/authMiddleware.js";

const messageRoutes = express.Router();

const getAllMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({});
  console.log(messages);

  res.json(messages);
});

const changeMessageStatus = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.body.payload.id);
  console.log(message);

  if (message) {
    message.isRead = !message.isRead;
    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } else {
    res.status(404);
    throw new Error("Could not update status");
  }
});

messageRoutes.route("/").get(protectRoute, admin, getAllMessages);
messageRoutes.route("/").put(protectRoute, admin, changeMessageStatus);

export default messageRoutes;
