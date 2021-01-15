const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { writeFile, createReadStream } = require("fs-extra");
const { join } = require("path");
const { parseString } = require("xml2js");
const { begin } = require("xmlbuilder");
const { promisify } = require("util");
const axios = require("axios").default;

const router = express.Router();
const upload = multer({});

const productImagesPath = join(__dirname, "../../public/images/products");

const readFileHandler = (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, filename)).toString());
  return targetFile;
};

const writeFileHandler = (writeToFilename, file) => {
  fs.writeFileSync(path.join(__dirname, writeToFilename), JSON.stringify(file));
};

router.get("/", (req, res) => {
  try {
    res.send(readFileHandler("products.json"));
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", (req, res) => {
  try {
    const targetFile = readFileHandler("products.json");
    const product = targetFile.filter((product) => product._id === req.params.id);
    if (product.length > 0) {
      res.send(product);
    } else {
      res.send("No project with that ID found, please try again.");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/",
  [
    check("name").isLength({ min: 3 }).withMessage("Name is too short!"),
    check("description").isLength({ min: 8 }).withMessage("Description is too short!"),
    check("brand").isLength({ min: 3 }).withMessage("Brand name is too short!"),
    check("price").isNumeric().withMessage("Please enter a valid price (Must be a number)"),
    check("category").isLength({ min: 3 }).withMessage("Category is too short!"),
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
        const targetFile = readFileHandler("products.json");
        const newProduct = {
          ...req.body,
          reviews: [],
          _id: uniqid(),
          _createdAt: new Date(),
          _updatedAt: new Date(),
        };
        newProduct.price = parseInt(newProduct.price);
        console.log(req.body);
        targetFile.push(newProduct);
        writeFileHandler("products.json", targetFile);
        res.status(201).send(readFileHandler("products.json"));
      }
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/:id",
  [
    check("name").isLength({ min: 3 }).withMessage("Name is too short!"),
    check("description").isLength({ min: 8 }).withMessage("Description is too short!"),
    check("brand").isLength({ min: 3 }).withMessage("Brand name is too short!"),
    check("price").isNumeric().withMessage("Please enter a valid price (Must be a number)"),
    check("category").isLength({ min: 3 }).withMessage("Category is too short!"),
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
        const targetFile = readFileHandler("products.json");
        const originalProductData = targetFile.filter((product) => product._id === req.params.id);
        const filteredFile = targetFile.filter((product) => product._id !== req.params.id);
        const updatedProject = {
          ...originalProductData[0],
          ...req.body,
          price: parseInt(req.body.price),
          _updatedAt: new Date(),
        };
        filteredFile.push(updatedProject);
        writeFileHandler("products.json", filteredFile);
        res.send(filteredFile);
      }
    } catch (err) {
      console.log(err);
    }
  }
);

router.delete("/:id", (req, res, next) => {
  try {
    const targetFile = readFileHandler("products.json");
    const filteredFile = targetFile.filter((product) => product._id !== req.params.id);
    if (targetFile.filter((product) => product._id === req.params.id).length > 0) {
      writeFileHandler("products.json", filteredFile);
      res.send(filteredFile);
    } else {
      const err = new Error();
      err.message = {
        errors: [
          {
            value: req.params.id,
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

router.post("/:id/upload", upload.single("productPhoto"), async (req, res, next) => {
  try {
    const targetFile_products = readFileHandler("products.json");
    const indexOfProduct = targetFile_products.indexOf((product) => product._id === req.params.id);
    if (targetFile_products.filter((e) => e._id === req.params.id).length !== 0) {
      await writeFile(
        join(productImagesPath, `${req.params.id}${path.extname(req.file.originalname)}`),
        req.file.buffer
      );
      const filteredFile = targetFile_products.filter((product) => product._id !== req.params.id);
      const product = targetFile_products.filter((product) => product._id === req.params.id);
      (product[0].image = `http://localhost:3001/images/products/${req.params.id.toString()}${path.extname(
        req.file.originalname.toString()
      )}`),
        filteredFile.push(product[0]);
      fs.writeFileSync(join(__dirname, "products.json"), JSON.stringify(filteredFile));
      res.send("Image successfully uploaded");
    } else {
      const err = new Error();
      err.message = {
        errors: [
          {
            value: req.params.id,
            msg: "Product with that ID not found",
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

module.exports = router;
