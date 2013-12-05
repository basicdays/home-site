'use strict';
var path = require('path');
var express = require('express');
var endpoints = require('webUI/endpoints');


exports = module.exports = function() {
	var app = express();

// all environments
	app.set('port', process.env.PORT || 3010);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));

// development only
	if (app.get('env') == 'development') {
		app.use(express.errorHandler());
	}

	app.get('/', endpoints.home);
	app.get('/calendar', endpoints.calendar);

	return app;
};
