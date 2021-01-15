const mongoose = require("mongoose");
const { Schema,model } = require("mongoose");
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

productSchema.static("decreaseproductQuantity", async function (id, amount) {
  const product = await productModel.findByIdAndUpdate(id, {
    $inc: { availableQuantity: -amount },
  })
  return product
})
const productModel = model("product", productSchema)
productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("products", productSchema);
