'use strict';
var co = require('co'),
	should = require('chai').should(),
	db = require('webUI/db');


describe('db', function() {
	it('client', function(done) {
		co(function *() {
			var clientResults = yield db.getClient();
			var client = clientResults[0],
				next = clientResults[1];

			should.exist(client);
			next();
		})(done);
	});

	it('query()', function(done) {
		co(function *() {
			var result = yield db.query('select * from foo');
			should.exist(result);
		})(done);
	});
});
