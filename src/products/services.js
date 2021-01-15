const express = require("express");
const { join } = require("path");
const { parseString } = require("xml2js");
const { create } = require("xmlbuilder2");
const { promisify } = require("util");
const axios = require("axios").default;
const asyncParser = promisify(parseString);
const { readJSON } = require("fs-extra");

const router = express.Router();

const productsPath = join(__dirname, "./products.json");

const readData = async (filePath) => {
  try {
    const fileJson = await readJSON(filePath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const errorMessageUrl = (value, msg) => {
  const err = new Error();
  err.message = {
    errors: [
      {
        value: value,
        msg: msg,
        param: "_id",
        location: "url",
      },
    ],
  };
  err.httpStatusCode = 400;
  return err;
};

router.get("/sumtwo", async (req, res, next) => {
  try {
    let { productOne, productTwo } = req.query;

    const products = await readData(productsPath);
    const indexOfProductOne = products.findIndex((product) => product._id === productOne);
    const indexOfProductTwo = products.findIndex((product) => product._id === productTwo);

    if (indexOfProductOne !== -1 && indexOfProductTwo !== -1) {
      const productOnePrice = Math.round(products[indexOfProductOne].price);
      const productTwoPrice = Math.round(products[indexOfProductTwo].price);
      const xmlStr = `<soap:Envelope
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xmlns:xsd="http://www.w3.org/2001/XMLSchema"
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
          >
            <soap:Body>
              <Add xmlns="http://tempuri.org/">
                <intA>${productOnePrice}</intA>
                <intB>${productTwoPrice}</intB>
              </Add>
            </soap:Body>
          </soap:Envelope>`;
      const doc = create(xmlStr);

      const xml = doc.end({ prettyPrint: true });

      const response = await axios({
        method: "post",
        url: "http://www.dneonline.com/calculator.asmx?op=Add",
        data: xml,
        headers: { "Content-Type": "text/xml" },
      });
      const xmlResponse = response.data;
      const parsedJS = await asyncParser(xmlResponse);
      res.send(parsedJS["soap:Envelope"]["soap:Body"][0]["AddResponse"][0]["AddResult"][0]);
    } else {
      if (indexOfProductOne === -1 && indexOfProductTwo === -1) {
        const err = errorMessageUrl(`${productOne + " & " + productTwo}`, "Products with those IDs not found");
        next(err);
      } else if (indexOfProductOne === -1) {
        const err = errorMessageUrl(productOne, "Product with that ID was not found");
        next(err);
      } else {
        const err = errorMessageUrl(productTwo, "Product with that ID was not found");
        next(err);
      }
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
