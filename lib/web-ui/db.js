'use strict';
var pg = require('co-pg'),
    config = require('web-ui').config;


exports = module.exports = {
	getClient: function() {
		return pg.connect_(config.connectionStrings.main);
	},

	query: function *(query) {
		var clientResults = yield this.getClient();
		var client = clientResults[0],
			done = clientResults[1];

		var results = null;
		try {
			results = yield client.query_(query);
		} catch (ex) {
			throw new Error(ex);
		} finally {
			done();
		}
		return results;
	}
};
