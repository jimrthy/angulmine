'use strict';

/* Filters */

angular.module('minesweepApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
    filter('mineFilter', function() {
	// This approach doesn't seem to be a horrible performance for something this small,
	// but it feels ugly.
	// Especially since it doesn't seem to work correctly.

	// Totally moved into directives. Needs to completely and totally go away.
	return function(cell) {
	    var msg = '';
	    var result = ' ';

	    if(cell.hidden) {
		msg += "H";
		if(cell.flagged) {
		    result = 'F';
		    msg += "F";
		}
	    }
	    else {
		if(cell.bomb) {
		    // Player just lost.
		    result = ':(';
		    msg += "Too bad. So sad.";
		}
		else {
		    if(cell.neighboring_bombs > 0) {
			result = cell.neighboring_bombs;
			msg += "Danger: " + result;
		    }
		    else {
			msg += "Clear :-)";
		    }
		}
	    }
	    console.log(msg);
	}
    });
