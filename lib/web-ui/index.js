'use strict';
var fs = require('fs'),
	path = require('path');


var filePath = path.join(process.cwd(), 'config.json');

exports.config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
exports.boot = require("web-ui/boot");
