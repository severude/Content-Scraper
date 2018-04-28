'use strict';

const fs = require('fs');
const scrapeIt = require("scrape-it");
const Json2csvParser = require('json2csv').Parser;

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
      productList.forEach(productUrl => {
        scrapeIt(productUrl, {
          Price: '.shirt-details h1 span',
          Title: '.shirt-details h1',
          ImageUrl: {
            selector: '.shirt-picture span img',
            attr: 'src'},
          Url: '.breadcrumb',
          Time: '.footer .wrapper p'
        }).then(({ data, response }) => {
          // Message the results into the correct format
          const regex = /\$\d+ /;
          data.Title = data.Title.replace(regex, '');
          data.Url = productUrl;
          let date = new Date();
          data.Time = date.toLocaleString();
          // Convert to csv data
          const fields = ['Price', 'Title', 'ImageUrl', 'Url', 'Time'];
          const json2csvParser = new Json2csvParser({ fields });
          const csv = json2csvParser.parse(data);
           
          console.log(csv);          
        });
      });
    } else {
      // Connection error logic
      console.log(`There’s been a ${response.statusCode} error. Cannot connect to ${siteUrl}`);
    }
  });
