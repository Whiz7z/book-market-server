import dotenv from "dotenv";
dotenv.config();
import connectToDatabase from "./database.js";
import express from "express";
import path from "path";
import cors from "cors";
import multer from "multer";
import helmet from "helmet";
//Our Routes
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import bodyParser from "body-parser";

import fs from "fs";
// Schemas
import Product from "./models/Product.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(path.relative(__dirname, "/var/lib/data"));
    cb(null, path.resolve(path.resolve(), "../../../../var/lib/data"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// var corsOptions = {
//   origin: process.env.FRONTEND_URL,
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
//   credentials: true,
// };

const upload = multer({ storage: storage });
connectToDatabase();
const app = express();
app.use(helmet());
app.use(cors());
app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  const allowedOrigins = ["https://books-market.onrender.com"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
  next();
});
// app.use(
//   cors({
//     origin: "https://books-market.onrender.com",
//   })
// );
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));

const port = process.env.PORT || 5000;

app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/messages", messageRoutes);

app.use("/images", async (req, res, next) => {
  res.set("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/images", express.static("public"), async (req, res) => {});

app.post("/api/uploadimage", upload.single("image"), async (req, res) => {
  try {
    console.log("req file", req.file);
    fs.rename(
      req.file.destination + "/" + req.file.filename,
      req.file.destination +
        "/" +
        req.body.productId +
        "." +
        req.file.mimetype.split("/")[1],
      () => {
        console.log("good");
      }
    );
    const product = await Product.findById(req.body.productId);

    if (product) {
      product.imagePath =
        req.body.productId + "." + req.file.mimetype.split("/")[1];

      const updatedProduct = await product.save();
      res.send(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found.");
    }
  } catch (err) {}
});

app.listen(port, () => {
  console.log(`Server runs on poooooort ${port}. ${process.env.FRONTEND_URL}`);
});
