describe('toHHMMSS', function() {

	beforeEach(module('FLGames'));

	it('should ...', inject(function($filter) {

        var filter = $filter('toHHMMSS');

		expect(filter('input')).toEqual('output');

	}));

});