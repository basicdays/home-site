'use strict';
var pg = require('co-pg'),
	config = require('webUI').config;


exports = module.exports = {
	getClient: function() {
		return pg.connect(config.connectionStrings.main);
	},

	query: function *(query) {
		var clientResults = yield this.getClient();
		var client = clientResults[0],
			done = clientResults[1];

		var results = yield client.query(query);
		done();
		return results;
	}
};
