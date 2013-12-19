'use strict';
var pg = require('pg'),
	thunk = require('thunkify');


pg.connect = thunk(pg.connect);
pg.Client.prototype.query = thunk(pg.Client.prototype.query);

exports = module.exports = pg;
