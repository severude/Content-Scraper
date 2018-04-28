'use strict';

const fs = require('file-system');
const axios = require('axios');
const cheerio = require('cheerio');

if(!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

axios.get('http://shirts4mike.com/shirts.php')
.then((response) => {
  console.log(response.statusCode);
  const $ = cheerio.load(response.data);
  $('.products li').each(function(index, elem) {
      console.log($(this).text());
    });
})
.catch(function (error) {
  console.log(error);
});
