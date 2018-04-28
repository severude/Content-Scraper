'use strict';

const fs = require('fs');
const scrapeIt = require("scrape-it");

// Url constants
const siteUrl = 'http://shirts4mike.com/shirts.php';
const productUrl = 'http://shirts4mike.com/';
const productList = [];

// Create a data folder if it doesn't exist
if(!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

// Scrape the site url for a list of product urls
scrapeIt(siteUrl, {
  // Capture the product url for each li under ul.products
  products: {
    listItem: ".products li",
    data: {
        url: {
            selector: "a",
            attr: "href"
        }
    }
}}).then(({ data, response }) => {
    if(response.statusCode === 200) {
      // Build final product urls
      data.products.forEach(product => {
        productList.push(productUrl + product.url);
      });
      // Scrape each product
      productList.forEach(product => {
        console.log(product);
      });
    } else {
      // Connection error logic
      console.log(`There’s been a ${response.statusCode} error. Cannot connect to ${siteUrl}`);
    }
  });
