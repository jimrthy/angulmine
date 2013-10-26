'use strict';

/* Filters */

angular.module('minesweepApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
    filter('mineFilter', function() {
	return function(cell) {
	    var result = ' ';
	    if(cell.hidden) {
		if(cell.flagged) {
		    result = 'F';
		}
	    }
	    else {
		if(cell.bomb) {
		    // Player just lost.
		    result = ':(';
		}
		else {
		    if(cell.neighboring_bombs > 0) {
			result = cell.neighboring_bombs;
		    }
		}
	    }
	}
    });
