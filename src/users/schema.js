const { Schema, model } = require("mongoose")

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: String,
    email: String,
    age: {
      type: Number
    },

    cart: [
      {
        name: String,
        brand:String,
        category: String,
        price: Number,
        quantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
)

UserSchema.static("findproductInCart", async function (id, productId) {
  const isproductThere = await UserModel.findOne({
    _id: id,
    "cart._id": productId,
  })
  return isproductThere
})

UserSchema.static(
  "incrementCartQuantity",
  async function (id, productId, quantity) {
    await UserModel.findOneAndUpdate(
      {
        _id: id,
        "cart._id": productId,
      },
      { $inc: { "cart.$.quantity": quantity } }
    )
  }
)

UserSchema.static("addproductToCart", async function (id, product) {
  await UserModel.findOneAndUpdate(
    { _id: id },
    {
      $push: { cart: product },
    }
  )
})

UserSchema.static("calculateCartTotal", async function (id) {
  const { cart } = await UserModel.findById(id)
  return cart
    .map(product => product.price * product.quantity)
    .reduce((acc, el) => acc + el, 0)
})

const UserModel = model("User", UserSchema)

module.exports = UserModel