var background = require('../../src/background.js');

var assert = require('chai').assert;

describe('Array', function() {
	describe('#indexOf()', function() {
		it('should return -1 when the value is not present', function() {
			assert.equal([1, 2, 3].indexOf(4), -1);
		});
	});
});

describe('Index', function() {

	describe('blabla', function() {

		it('should double the input', function() {
			assert.equal(index.blabla(1), 2);
			assert.equal(index.blabla(-1), -2);
		});

	});

});