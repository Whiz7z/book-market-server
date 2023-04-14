import Tag from "../models/Tag.js";
import express from "express";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { protectRoute, admin } from "../middleware/authMiddleware.js";

const tagRoutes = express.Router();

const getAllTags = asyncHandler(async (req, res) => {
  try {
    const allTags = await Tag.find({});
    console.log(allTags[0].allTags);

    if (allTags[0].allTags) {
      res.json(allTags[0].allTags);
    } else {
      res.status(404);
      throw new Error("Tags could not be found.");
    }
  } catch (err) {}
});

tagRoutes.route("/").get(getAllTags);

export default tagRoutes;
