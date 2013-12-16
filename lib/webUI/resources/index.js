'use strict';
var express = require('express'),
	home = require('webUI/resources/root'),
	calendar = require('webUI/resources/calendar');


var app = module.exports = express();
app.use(home);
//app.use(calendar);
