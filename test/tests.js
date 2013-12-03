'use strict';
require('chai').should();

describe('Array', function(){
	describe('#indexOf()', function(){
		it('should return -1 when the value is not present', function() {
			var values = [1, 2, 3];
			values.indexOf(5).should.equal(-1);
			values.indexOf(0).should.equal(-1);
		});
	});
});
