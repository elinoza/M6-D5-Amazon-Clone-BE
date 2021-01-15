const express = require("express");
const reviewModel = require("./schema")

const reviewsRouter = express.Router()

reviewsRouter.get("/",  async(req, res) => {
  try {
    const reviews = await reviewModel.find()
    res.send(reviews);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
reviewsRouter.post("/", async (req, res, next) => {
  try {
    const newreview = new reviewModel(req.body)

    const { _id } = await newreview.save()
    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

reviewsRouter.get("/:id", async (req, res, next) => {
  try {
    const review = await reviewModel.findById(req.params.id)
    res.send(review)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

reviewsRouter.put("/:id", async (req, res, next) => {
  try {
    const modifiedreview = await reviewModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    )
    if (modifiedreview) {
      res.send(modifiedreview)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

reviewsRouter.delete("/:id", async (req, res, next) => {
  try {
    const review = await reviewModel.findByIdAndDelete(req.params.id)
    if (review) {
      res.send(review)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})


module.exports = reviewsRouter;
