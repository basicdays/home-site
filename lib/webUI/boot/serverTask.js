'use strict';
var http = require('http');


exports = module.exports = function(app) {
	http.createServer(app).listen(app.get('port'), function() {
		console.log('Express server listening on port ' + app.get('port'));
	});
};
