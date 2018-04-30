'use strict';

// Module requirements
const fs = require('fs');
const scrapeIt = require("scrape-it");
const Json2csvParser = require('json2csv').Parser;

// Url constants
const siteUrl = 'http://shirts4mike.com/shirts.php';
const productString = 'http://shirts4mike.com/';
let productUrl = []; // Storage for each product url
let productData = [];  // Storage for each product's scraped data

// Create a data folder if it doesn't exist
if(!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

// Error message logging to file
function printErrorMessage(message) {
  const errorFileName = 'scraper-error.log';
  const date = new Date();
  const errorMessage = `[${date}] <${message}>\n`;
  fs.appendFileSync(errorFileName, errorMessage);
  console.error(message);
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
  }
}).then(({ data, response }) => {
    // If site url has successfully been scraped, then scrape each product
    if(response.statusCode === 200) {
      // Build final product urls
      data.products.forEach(product => {
        productUrl.push(productString + product.url);
      });
      // Scrape each product
      productUrl.forEach(product => {
        productData.push(scrapeIt(product, {
          Title: '.shirt-details h1',
          Price: '.shirt-details h1 span',
          ImageUrl: {
            selector: '.shirt-picture span img',
            attr: 'src'},
          Url: '.breadcrumb',
          Time: '.footer .wrapper p'
        }).then(({ data, response }) => {
          // Massage the results into the correct format
          if(response.statusCode === 200) {
            const regex = /\$\d+ /;
            data.Title = data.Title.replace(regex, '');
            data.Url = product;
            let date = new Date();
            data.Time = date.toLocaleString();
            productData.push(data);
          } else {
            // Print out error message with statusCode for the product page
            const message = `There’s been a ${response.statusCode} error while connecting to ${product}`;
            printErrorMessage(message);
          }
        }));
      });
      // All scraping is done - process the data
      Promise.all(productData).then(() => {
          const fields = ['Title', 'Price', 'ImageUrl', 'Url', 'Time'];
          const json2csvParser = new Json2csvParser({ fields });
          const csvData = json2csvParser.parse(productData);
          const fileDate = new Date().toLocaleDateString();
          const csvFileName = `./data/${fileDate}.csv`;
          fs.writeFileSync(csvFileName, csvData);
          console.log(`Site ${siteUrl} was successfully scraped to ${csvFileName}`);
      })
    } else {
      // Print out error message with statusCode for the main page
      const message = `There’s been a ${response.statusCode} error while connecting to ${siteUrl}`;
      printErrorMessage(message);
    }
  }).catch(error => {
      // Print out a connection error message
      const message = `The domain name can't be resolved. Cannot connect to ${siteUrl}`;
      printErrorMessage(message);
});
