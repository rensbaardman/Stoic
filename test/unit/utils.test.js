var utils = require('../../src/utils.js');

var assert = require('assert');

describe('utils', function() {

	describe('delete_it', function() {

		it('should delete integers', function() {
			assert.equal(utils.delete_it(123), '');
		});

		it('should delete lists', function() {
			assert.equal(utils.delete_it([1, 2, 3]), '')
		});
	});

});
