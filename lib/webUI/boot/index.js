'use strict';
var expressTask = require('webUI/boot/expressTask');
var serverTask = require('webUI/boot/serverTask');


exports = module.exports = function() {
	var app = expressTask();
	serverTask(app);
};
