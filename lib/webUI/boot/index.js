'use strict';
var expressTask = require('webUI/boot/expressTask'),
	serverTask = require('webUI/boot/serverTask');


exports = module.exports = function() {
	var app = expressTask();
	serverTask(app);
};
