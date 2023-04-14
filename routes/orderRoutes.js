import express from "express";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import { protectRoute, admin } from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
const orderRoutes = express.Router();

const calculateTotalPrice = (items) => {
  let totalPrice = 0;
  for (let i = 0; i < items.length; i++) {
    totalPrice += items[i].quantity * items[i].item.price;
  }

  return totalPrice;
};

const createOrder = asyncHandler(async (req, res) => {
  console.log("order created ----- ", req.body);

  const order = await Order.create({
    user: req.body.buyer._id,
    username: req.body.buyer.name,
    email: req.body.buyer.email,
    orderItems: req.body.items.map((item) => {
      return {
        title: item.item.title,
        quantity: item.quantity,
        price: item.item.price,
        id: item.item._id,
      };
    }),
    shippingAddress: req.body.address,
    totalPrice: parseFloat(calculateTotalPrice(req.body.items).toFixed(2)),
    isDelivered: false,
    status: "prepearing",
  });

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(400).send("We could not create order.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  const allOrders = await Order.find().populate(["user"]);
  //console.log("all orders --- ", allOrders);

  if (allOrders) {
    res.status(200).json(allOrders);
  } else {
    res.status(400).send("We could not create order.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

const getAllUsersOrders = asyncHandler(async (req, res) => {
  //console.log(req.user);
  if (req.user._id) {
    const myOrders = await Order.find({ user: req.user._id });
    console.log(myOrders);
    res.status(200).json(myOrders);
  } else {
    res.status(400).send("We could not find your orders.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

const changeOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body.payload;
  console.log("all orders --- ", status);

  const _id = mongoose.Types.ObjectId(orderId);

  const order = await Order.findById(_id);
  console.log(order);
  if (order && !status.trim() == "" && order.status !== "Canceled") {
    order.status = status;
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } else {
    res.status(400).send("We could not change order status.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId, status } = req.body.payload;
  console.log("all orders --- ", status);

  const _id = mongoose.Types.ObjectId(orderId);

  const order = await Order.findById(_id);
  console.log(order);
  if (
    order &&
    !status.trim() == "" &&
    order.status !== "Canceled" &&
    order.status !== "Delivered"
  ) {
    order.status = "Canceled";
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } else {
    res.status(400).send("We could not change order status.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

orderRoutes.route("/createOrder").post(createOrder);
orderRoutes.route("/myorders").get(protectRoute, getAllUsersOrders);
orderRoutes.route("/").get(protectRoute, admin, getAllOrders);
orderRoutes.route("/").put(protectRoute, admin, changeOrderStatus);
orderRoutes.route("/cancel").put(protectRoute, cancelOrder);

export default orderRoutes;
