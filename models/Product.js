import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: Array,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    imagePath: {
      type: String,
      required: false,
    },
    isProductOfTheWeek: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  if (!this.isModified("category")) return next();
  this.category = this.category
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substring(1).toLowerCase())
    .join(" ");

  console.log(this.category);
});

const Product = mongoose.model("Products", productSchema);

export default Product;
