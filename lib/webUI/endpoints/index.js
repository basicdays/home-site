"use strict";
var express = require('express'),
	home = require('webUI/endpoints/home'),
	calendar = require('webUI/endpoints/calendar');


var app = module.exports = express();
app.use(home);
//app.use(calendar);
