'use strict';

const fs = require('file-system');

if(!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}
