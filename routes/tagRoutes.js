import Tag from "../models/Tag.js";
import Product from "../models/Product.js";
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

const deleteChoosenTags = asyncHandler(async (req, res) => {
  const { tags } = req.body;
  console.log("tagss", tags);
  try {
    const allTags = await Tag.find({});
    console.log(allTags[0].allTags);
    const filteredTgs = allTags[0].allTags.filter(
      (tag) => tags.includes(tag) !== true
    );
    allTags[0].allTags = filteredTgs;
    const newTags = await allTags[0].save();

    const allProducts = await Product.find({ tags: { $in: tags } });

    allProducts.forEach(async (product) => {
      product.tags = product.tags.filter((tag) => tags.includes(tag) !== true);
      await product.save();
    });

    console.log(allProducts);

    console.log("new tags", newTags);
    if (newTags) {
      res.json(newTags);
    } else {
      res.status(404).json("Couldn't delete tags");
      throw new Error("Tags could not be found.");
    }
  } catch (err) {}
});

tagRoutes.route("/").get(getAllTags);
tagRoutes.route("/delete").put(deleteChoosenTags);

export default tagRoutes;
