const express = require("express")
const mongoose = require("mongoose")
const UserModel = require("./schema")
const productModel = require("../products/schema")

const usersRouter = express.Router()

usersRouter.post("/", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body)

    const { _id } = await newUser.save()
    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserModel.find()
    res.send(users)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.get("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id)
    res.send(user)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.put("/:id", async (req, res, next) => {
  try {
    const modifiedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    )
    if (modifiedUser) {
      res.send(modifiedUser)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.delete("/:id", async (req, res, next) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id)
    if (user) {
      res.send(user)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})



usersRouter.post("/:id/add-to-cart/:productId", async (req, res, next) => {
  try {
    const product = await productModel.decreaseproductQuantity(
      req.params.productId,
      req.body.quantity
    )
    if (product) {
      const newproduct = { ...product.toObject(), quantity: req.body.quantity }

      const isproductThere = await UserModel.findproductInCart(
        req.params.id,
        req.params.productId
      )
      if (isproductThere) {
        await UserModel.incrementCartQuantity(
          req.params.id,
          req.params.productId,
          req.body.quantity
        )
        res.send("Quantity incremented")
      } else {
        await UserModel.addproductToCart(req.params.id, newproduct)
        res.send("New product added!")
      }
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/:id/calculate-cart-total", async (req, res, next) => {
  try {
    const total = await UserModel.calculateCartTotal(req.params.id)
    res.send({ total })
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter