'use strict';
var express = require('express'),
	home = require('web-ui/resources/root'),
	calendar = require('web-ui/resources/calendar');


var app = module.exports = express();
app.use(home);
//app.use(calendar);
