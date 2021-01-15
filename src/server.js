const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const listEndpoints = require("express-list-endpoints")
const productsRoutes = require("./products");
const reviewsRoutes = require("./reviews");
const usersRoutes = require("./users");
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling");

const server = express();

const port = process.env.PORT || 3001;

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

server.use(cors());
server.use(express.json());
server.use(loggerMiddleware);

server.use("/products", productsRoutes);
server.use("/reviews", reviewsRoutes);
server.use("/users", usersRoutes);

server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);
console.log(listEndpoints(server))

mongoose.connect(process.env.MONGO_CONNECT, { useNewUrlParser: true, useUnifiedTopology: true }).then(
  server.listen(port, () => {
    console.log("Server is running on port: ", port);
  })
);
