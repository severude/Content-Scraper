'use strict';

const fs = require('file-system');
const rp = require('request-promise');
const cheerio = require('cheerio');

if(!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

const options = {
    uri: `http://shirts4mike.com/shirts.php`,
    transform: function (body) {
      return cheerio.load(body);
    }
  };

  rp(options)
  .then(($) => {
    $('.products li').each(function(i, elem) {
        console.log($(this).text());
      });
  })
  .catch((err) => {
    console.log(err);
  });
