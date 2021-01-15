const express = require("express");
const productSchema = require("./schema");
const reviewSchema = require("../reviews/schema");
const mongoose = require("mongoose")
const multer = require("multer")

const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../cloudinary")

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: "amazon"
  }
})
const cloudMulter =  multer({ storage: cloudStorage})

const productsRouter = express.Router();

///UPLOADING IMAGE TO CLOUDINARY

productsRouter.post("/:id/add/image", 
cloudMulter.single("image"), async (req, res, next) =>{
  try{
      // const newImage = new productSchema(req.body)
      console.log(req.body)
      const imageToinsert = { ...req.file.path.toObject()}
      const updated = await productSchema.findByIdAndUpdate(
            req.params.id,
            {
             
                images:imageToinsert,
             
            },
            { runValidators: true, new: true }
          )
          res.status(201).send(updated)
        }
  catch(ex){
      console.log(ex)
      next(ex)
  }
})

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await productSchema.find();
    res.send(products);
  } catch (error) {
    console.log(error);
  }
});


productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
  
    const product = await productSchema.findById(id)
    if (product) {
      res.send(product)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("While reading products list a problem occurred!")
  }
})




productsRouter.get("/category/:categoryName", async (req, res, next) => {
  try {
   // const categoryName= /^req.params.categoryName$/i

  
            const filteredProducts = await  productSchema.find(
            {
                category: {$regex: new RegExp('^' + req.params.categoryName, 'i')}
            }
          )
          res.send(filteredProducts)
        
 
  } catch (error) {
    console.log(error)
    next("While reading products list a problem occurred!")
  }
})

productsRouter.post("/", async (req, res, next) => {
  try {
    const newproduct = new productSchema(req.body)
    const { _id } = await newproduct.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const product = await productSchema.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    })
    if (product) {
      res.send(product)
    } else {
      const error = new Error(`product with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await productSchema.findByIdAndDelete(req.params.id)
    if (product) {
      res.send("Deleted")
    } else {
      const error = new Error(`product with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

///EMBEDDING REVIEWS
/// EMBEDDING REVIEWS PART BELOW

productsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
 
   
    const review = new reviewSchema(req.body)
    const reviewToInsert = { ...review.toObject()}

    const updated = await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: reviewToInsert,
        },
      },
      { runValidators: true, new: true }
    )
    res.status(201).send(updated)
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const { reviews} = await productSchema.findById(req.params.id, {
      reviews: 1,
      _id: 0,
    })
    res.send(reviews)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productsRouter.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews} = await productSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
      reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    )

    if (reviews && reviews.length > 0) {
      res.send(reviews[0])
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productsRouter.delete("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const modifiedreview = await productSchema.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          reviews: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      },
      {
        new: true,
      }
    )
    res.send(modifiedreview)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

productsRouter.put("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { reviews} = await productSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    )

    if (reviews&& reviews.length > 0) {
      const reviewToReplace = { ...reviews[0].toObject(), ...req.body }

      const modifiedreview = await productSchema.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
        },
        { $set: { "reviews.$": reviewToReplace } },
        {
          runValidators: true,
          new: true,
        }
      )
      res.send(modifiedreview)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})



module.exports = productsRouter;
