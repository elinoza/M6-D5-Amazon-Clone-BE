const { Schema, model } = require("mongoose")

const reviewSchema = new Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    rate: { type: String, required: true },
   
  },
  {
    timestamps: true,
  }
)

module.exports = model("review", reviewSchema)