'use strict';
var expressTask = require('web-ui/boot/express-task'),
	serverTask = require('web-ui/boot/server-task');


exports = module.exports = function() {
	var app = expressTask();
	serverTask(app);
};
