import express from "express";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_TEST);

const paymentRoutes = express.Router();

const calculateTotalPrice = (items) => {
  let totalPrice = 0;
  for (let i = 0; i < items.length; i++) {
    totalPrice += items[i].quantity * items[i].item.price;
  }

  return totalPrice;
};

const createPayment = async (req, res) => {
  let { items } = req.body;
  //console.log(items);
  const totalPrice = parseFloat(calculateTotalPrice(items).toFixed(2));

  console.log("total price", totalPrice);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: "USD",
      description: "Flea Shop",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
      totalPrice,
    });
  } catch (error) {
    console.log("Error", error);
    res.send({
      message: "Payment failed",
      success: false,
    });
  }
};

paymentRoutes.route("/create-payment-intent").post(createPayment);

export default paymentRoutes;
