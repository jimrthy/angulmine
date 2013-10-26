'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
    beforeEach(module('minesweepApp.directives'));

    describe('app-version', function() {
	it('should print current version', function() {
	    module(function($provide) {
		$provide.value('version', 'TEST_VER');
	    });
	    inject(function($compile, $rootScope) {
		var element = $compile('<span app-version></span>')($rootScope);
		expect(element.text()).toEqual('TEST_VER');
	    });
	});
    });
    describe('mine-cell', function() {
	// FIXME: What on earth is going on here?
	it('should hide hidden cell', function() {
	    inject(function($compile, $rootScope) {
		var element = $compile('<span mine-cell></span>')($rootScope);
		expect(element.text()).toEqual(' ');
	    });
	});
    });
});
