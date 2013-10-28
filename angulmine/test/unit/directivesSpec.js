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
		var s = '<ul><li ng-repeat="row in GetBoard()">';
		s += '<ul><li ng-repeat="cell in row"><span class="hidden" mine-cell="cell"></span></li></ul>';
		s += '</li></ul>';
		var element = $compile(s)($rootScope);

		var msg = "Just compiled a span to test:\n";
		// Looks like we almost have the complete DOM
		/*for(var prop in element) {
		    msg += '\n\t' + prop + ': ' + element[prop];
		};*/
		// We don't, of course.
		msg += element;
		try {
		    // The css() function isn't doing what I expected at all.
		    // FIXME: Figure out what's going on here.
		    msg += "\n\tCSS: " + element.css(element);
		    msg += "\n\tClass: " + element.css(element, 'class');
		}
		catch(e) {
		    msg += "No CSS...I could have sworn I saw this in the full object dump.\n";
		    // Actually, that doesn't really look like it was the problem:
		    msg += e;
		    try {
			msg += "\nStack Trace:\n" + e.stack;
		    }
		    catch(e2) {
			msg += "\nApparently that isn't an Error. Failure from trying to access stack trace:\n"
			+ e2;
		    }


		    msg += "\nElements I do have available:";
		    for(var prop in element) {
			msg += '\n\t' + prop;
		    }
		    msg += "\n\tCSS: " + element.css;
		    msg += "\n\tHTML: " + element.html();
		    msg += "\n\tText: '" + element.text() + "'";
		}
		console.debug(msg);

		var listItem = element.find(".hidden");
		// The html is undefined here.
		expect(listItem.html()).toEqual('&nbsp');
		// listItem.text() is just an empty string. What's going on?
	    });
	});
    });
});
