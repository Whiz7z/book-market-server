import express from "express";
import Product from "../models/Product.js";
import Tag from "../models/Tag.js";
import fs from "fs";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { protectRoute, admin } from "../middleware/authMiddleware.js";
import path from "path";

const productRoutes = express.Router();

const getProducts = asyncHandler(async (req, res) => {
  console.log(req.query.category);

  if (
    req.query.category === "all" ||
    req.query.category === "" ||
    req.query.category == undefined
  ) {
    const products = await Product.find({});
    res.json(products);
  } else {
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  }
});

const getProductById = asyncHandler(async (req, res) => {
  const id = req.query.id;

  if (id.trim("").length > 0) {
    try {
      const product = await Product.findById(id);
      console.log(product);
      res.json(product);
    } catch (err) {}
  } else {
    res.status(404).json("Product not found");
    throw new Error("Product not found.");
  }
});

const getProductOfTheWeek = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ isProductOfTheWeek: true });

  if (product) {
    try {
      console.log(product);
      res.json(product);
    } catch (err) {}
  } else {
    res.status(404).json("Product not found");
    throw new Error("Product not found.");
  }
});

getProductOfTheWeek;

const getProductByTags = asyncHandler(async (req, res) => {
  if (req.query.tags && req.query.tags.trim("").length > 0) {
    const tags = req.query.tags.split(",");

    try {
      const products = await Product.find({ tags: { $all: tags } });

      res.json(products);
    } catch (err) {}
  } else {
    res.status(404).json("Products not found");
    throw new Error("Products not found.");
  }
});

const getCategoriesAndPreview = asyncHandler(async (req, res) => {
  try {
    const data = await Product.find({}).select("category imagePath -_id");
    const categories = await Product.find({}).select("category -_id");
    const counts = {};

    for (const num of categories) {
      counts[num.category] = counts[num.category]
        ? counts[num.category] + 1
        : 1;
    }
    console.log(counts);
    const unique = [
      ...new Map(data.map((item) => [item["category"], item])).values(),
    ];
    console.log("category");

    const response = {
      unique: unique,
      counts: counts,
    };
    res.json(response);
  } catch (err) {}
});

const updateProduct = asyncHandler(async (req, res) => {
  //console.log(req.body);
  const {
    id,
    title,
    description,
    price,
    category,
    stock,
    isPhotoChanged,
    tags,
  } = req.body.product;

  const _id = mongoose.Types.ObjectId(id);

  const product = await Product.findById(_id);
  if (product) {
    product.title = title;
    product.description = description;
    product.price = price;
    product.category = category;
    product.stock = stock;
    product.tags = tags.filter(
      (value, index, array) =>
        array.indexOf(value) === index && value.trim().length > 0
    );
    const updatedProduct = await product.save();
    console.log("updated product", updatedProduct);

    try {
      if (isPhotoChanged) {
        fs.unlink(
          "../server/productImages/" + updatedProduct.imagePath,
          (err) => {
            console.log("Delete File successfully.");
          }
        );
      }
    } catch (err) {}

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error("Product not found.");
  }
});

const setProductOfTheWeek = asyncHandler(async (req, res) => {
  //console.log(req.body);
  const { id } = req.body;

  const _id = mongoose.Types.ObjectId(id);

  const prevProduct = await Product.findOne({ isProductOfTheWeek: true });

  if (prevProduct) {
    prevProduct.isProductOfTheWeek = false;
    try {
      await prevProduct.save();
    } catch (err) {}
  }

  const product = await Product.findById(_id);
  if (product) {
    product.isProductOfTheWeek = true;
    const newProductOfTheWeek = await product.save();

    res.json(newProductOfTheWeek);
  } else {
    res.status(404);
    throw new Error("Product not found.");
  }
});

const removeProductFromTheWeek = asyncHandler(async (req, res) => {
  //console.log(req.body);
  const { id } = req.body;

  const _id = mongoose.Types.ObjectId(id);

  const product = await Product.findById(_id);
  if (product) {
    product.isProductOfTheWeek = false;
    const newProductOfTheWeek = await product.save();

    res.json(newProductOfTheWeek);
  } else {
    res.status(404);
    throw new Error("Product not found.");
  }
});

const createProduct = asyncHandler(async (req, res) => {
  const { title, description, price, category, stock, author, tags } =
    req.body.product;
  console.log(req.body);

  tags.forEach(function (part, index, theArray) {
    theArray[index] = part.trim();
  });
  // const _id = mongoose.Types.ObjectId(id);
  const newProduct = await Product.create({
    title: title,
    author: author,
    description: description,
    price: price,
    category: category
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(" "),
    tags: tags.filter(
      (value, index, array) =>
        array.indexOf(value) === index && value.trim().length > 0
    ),

    stock: stock,
  });
  console.log("product cc", newProduct);
  await newProduct.save();

  const allTags = await Tag.find({});

  console.log(allTags);

  allTags[0].allTags.push(...tags);

  const updatedTags = await allTags[0].save();

  console.log("updated tags", updatedTags);
  if (newProduct) {
    res.json(newProduct);
  } else {
    res.status(404);
    throw new Error("Product could not be uploaded.");
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const { productId } = req.body;

    const _id = mongoose.Types.ObjectId(productId);
    const productToDelete = await Product.findById(_id);

    if (productToDelete) {
      const deleted = await Product.deleteOne({ _id: _id });
      console.log("deleted", deleted);

      fs.unlink(
        "../server/productImages/" + productToDelete.imagePath,
        (err) => {
          if (err) {
            console.log(err);
          }

          console.log("Delete File successfully.");
        }
      );
      res.json("product deleted");
    } else {
      res.status(404);
      throw new Error("Product not found.");
    }
  } catch (error) {
    console.log(error);
  }
});

productRoutes.route("/").get(getProducts);
productRoutes.route("/ofTheWeek").get(getProductOfTheWeek);
productRoutes.route("/byTags").get(getProductByTags);
productRoutes.route("/byId").get(getProductById);
productRoutes.route("/categories").get(getCategoriesAndPreview);
productRoutes.route("/").put(protectRoute, admin, updateProduct);
productRoutes
  .route("/setOnTheBanner")
  .put(protectRoute, admin, setProductOfTheWeek);
productRoutes
  .route("/removeFromTheBanner")
  .put(protectRoute, admin, removeProductFromTheWeek);
productRoutes.route("/").post(protectRoute, admin, createProduct);
productRoutes.route("/").delete(protectRoute, admin, deleteProduct);

export default productRoutes;
