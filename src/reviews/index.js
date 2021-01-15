const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  try {
    res.send("test");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
