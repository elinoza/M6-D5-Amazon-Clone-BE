const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new Schema(
  {
    name: String,
    description: String,
    brand: String,
    image: String,
    price: Number,
    category: String,
    reviews: [
      {
        comment: String,
        rate: Number,
      },
      {
        timestamps: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("products", productSchema);
