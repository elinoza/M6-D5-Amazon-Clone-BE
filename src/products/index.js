const express = require("express");
const productSchema = require("./schema");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await productSchema.find();
    res.send(products);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
