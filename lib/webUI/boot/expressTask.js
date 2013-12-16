'use strict';
var path = require('path');
var express = require('express');
var endpoints = require('webUI/resources');


exports = module.exports = function() {
	var app = express();
	var projectRoot = path.dirname(require.resolve('webUI'));

	// all environments
	app.set('port', process.env.PORT || 3010);
	app.set('view engine', 'ejs');

	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.cookieParser('fruity blarghs'));
	app.use(express.session());

	app.use(endpoints);
	app.use(express.static(projectRoot + '/public'));

	// development only
	if (app.get('env') == 'development') {
		app.use(express.errorHandler());
	}

	return app;
};
