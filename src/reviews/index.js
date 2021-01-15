const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { writeFile, createReadStream } = require("fs-extra");
const { join } = require("path");

const router = express.Router();
const upload = multer({});

const productImagesPath = join(__dirname, "../../public/images/products");

const readFileHandler = (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, filename)).toString());
  return targetFile;
};

const readProductsFileHandler = (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, "../products", filename)).toString());
  return targetFile;
};

const writeFileHandler = (writeToFilename, file) => {
  fs.writeFileSync(path.join(__dirname, writeToFilename), JSON.stringify(file));
};

const writeProductsFileHandler = (writeToFilename, file) => {
  fs.writeFileSync(path.join(__dirname, "../products", writeToFilename), JSON.stringify(file));
};

const updateReviewsFileHandler = () => {
  const targetFile_products = readProductsFileHandler("products.json");
  const reviewsArray = [];
  targetFile_products.forEach((product) => {
    product.reviews.forEach((review) => {
      reviewsArray.push(review);
    });
  });
  writeFileHandler("reviews.json", reviewsArray);
};

router.get("/", (req, res) => {
  try {
    updateReviewsFileHandler();
    res.send(readFileHandler("reviews.json"));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", (req, res) => {
  try {
    updateReviewsFileHandler();
    const targetFile_reviews = readFileHandler("reviews.json");
    const indexOfReview = targetFile_reviews.findIndex((review) => review._id === req.params.id);
    if (indexOfReview !== -1) {
      const review = targetFile_reviews[indexOfReview];
      res.send(review);
    } else {
      const err = new Error();
      err.message = {
        errors: [
          {
            value: req.params.id,
            msg: "Review with that ID not found",
            param: "_id",
            location: "url",
          },
        ],
      };
      err.httpStatusCode = 400;
      next(err);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post(
  "/:productId",
  [
    check("comment").isLength({ min: 3 }).withMessage("Name is too short!"),
    check("rate").isNumeric({ min: 1, max: 5 }).withMessage("Please enter a number between 1-5"),
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const targetFile_products = readProductsFileHandler("products.json");
        const index = targetFile_products.findIndex((product) => product._id === req.params.productId);
        if (index === -1) {
          const err = new Error();
          err.message = {
            errors: [
              {
                value: req.params.productId,
                msg: "Product with that ID not found",
                param: "_id",
                location: "url",
              },
            ],
          };
          err.httpStatusCode = 400;
          next(err);
        } else {
          targetFile_products[index].reviews = [
            ...targetFile_products[index].reviews,
            { ...req.body, _productId: targetFile_products[index]._id, _id: uniqid(), _createdAt: new Date() },
          ];
          writeProductsFileHandler("products.json", targetFile_products);
          res.status(201).send("New review added successfully");
        }
      }
    } catch (err) {
      console.log(err);
      next(err);
    }
  }
);

router.put(
  "/:productId/:reviewId",
  [
    check("comment").isLength({ min: 3 }).withMessage("Name is too short!"),
    check("rate").isNumeric({ min: 1, max: 5 }).withMessage("Please enter a number between 1-5"),
  ],
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      } else {
        const targetFile_products = readProductsFileHandler("products.json");
        const indexOfProduct = targetFile_products.findIndex((product) => product._id === req.params.productId);
        const indexOfReview = targetFile_products[indexOfProduct].reviews.findIndex(
          (review) => review._id === req.params.reviewId
        );

        targetFile_products[indexOfProduct].reviews[indexOfReview] = {
          ...targetFile_products[indexOfProduct].reviews[indexOfReview],
          comment: req.body.comment,
          rate: req.body.rate,
          _updatedAt: new Date(),
        };
        writeProductsFileHandler("products.json", targetFile_products);
        res.send(targetFile_products);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.delete("/:productId/:reviewId", (req, res, next) => {
  try {
    const targetFile_products = readProductsFileHandler("products.json");
    const indexOfProduct = targetFile_products.findIndex((product) => product._id === req.params.productId);
    const indexOfReview = targetFile_products[indexOfProduct].reviews.findIndex(
      (review) => review._id === req.params.reviewId
    );
    if (indexOfProduct !== -1) {
      if (indexOfReview !== -1) {
        targetFile_products[indexOfProduct].reviews.splice(indexOfReview, 1);
        writeProductsFileHandler("products.json", targetFile_products);
        res.send(targetFile_products);
      } else {
        const err = new Error();
        err.message = {
          errors: [
            {
              value: req.params.reviewId,
              msg: "Review with that ID not found",
              param: "_id",
              location: "url",
            },
          ],
        };
        err.httpStatusCode = 400;
        next(err);
      }
    } else {
      const err = new Error();
      err.message = {
        errors: [
          {
            value: req.params.productId,
            msg: "Product with that ID not found",
            param: "_id",
            location: "url",
          },
        ],
      };
      err.httpStatusCode = 400;
      next(err);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
