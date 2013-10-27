'use strict';

/* Directives */


angular.module('minesweepApp.directives', []).
    directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
	    elm.text(version);
	};
    }]).
    directive('mineCell', function() {
	function debug(scope, element, attrs) {
	    var msg = "Performing a Directive on a Cell.";

	    // The scope isn't interesting...except that I might have to
	    // break down and extract the board state from it if I can't find
	    // it under either element or attrs.
	    /*msg += "\nScope:";
	    for(var prop in scope.this) {
		msg += "\n\t";
		if(prop != '$new' && prop != 'constructor') {
		    msg += prop + ": ";
		    if(typeof(scope[prop]) != 'undefined') {
			msg += scope[prop];
		    }
		    else {
			msg += "Undefined";
		    }
		}
		else {
		    msg += "constructor: a big function for setting up a really nifty object";
		}
	    }*/

	    // This is pretty useless...it looks like it boils down to
	    // [[HTMLSpanElement]] in my unit tests and an [[HTMLTableCellElement]] in practice.
	    // Meaning that I just might be forced to get the value of the cell being
	    // drawn here by digging into this part of the DOM.
	    msg += "\n\nElement:\n" + element;

	    // Live, the available keys are [0, 1, 2, and 3]. Each with an Undefined value.
	    // Q: Huh??!
	    // A: Oh. attrs is still a string.
	    msg += "\n\nAttributes:\n" + attrs + " (a " + typeof(attrs) + ")";
	    for(var prop in attrs.mineCell) {
		if(prop != '$new' && prop != 'constructor') {
		    msg += "\n\t" + prop + ": ";
		    if(typeof(scope[prop]) != 'undefined') {
			msg += scope[prop];
		    }
		    else {
			msg += "Undefined";
		    }
		}
	    }
	    console.log(msg);
	}

	function link(scope, element, attrs) {
	    var cell = attrs.mineCell;

	    // Update element based upon cell's state:
	    var msg = "Directing: " + cell + "\n";
	    var result = ' ';

	    for(var prop in cell) {
		msg += prop + ": ";
		if(typeof(cell[prop]) != 'undefined') {
		    msg += cell[prop];
		}
		else {
		    msg += "undefined";
		}
		msg += "\n";
	    }

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
			msg += "Clear -- " + cell;
		    }
		}
	    }
	    msg += "\nDirected cell at (" + cell['x'] + ", " + cell['y'] + "): " + result + "\n" + msg;
	    console.log(msg);
	    element.text(result);

	    return result;
	}
	return { link: link };
    }).
    directive('playTime', function($timeout) {
	function link(scope, element, attrs) {
	    // Pulled almost line-by-line from http://docs.angularjs.org/guide/directive
	    var timeoutId;

	    function updateTime() {
		// TODO: Handling the timer this way seems to totally obsolete the
		// need for the time controller.
		// FIXME: Really need to completely decouple this from the scope...
		// Actually, the real problem is concerns that aren't separate.
		/*var display = 0;
		if(scope.started) {
		    var current = new Date();
		    display = Math.floor ((current - scope.started) / 1000);
		}*/
		//var display = scope.Time();
		element.text(display);
	    }

	    function scheduleUpdate() {
		// Note that doing this means we don't need to bother with the
		// time controller.

		// Save the timeoutId for canceling
		timeoutId = $timeout(function() {
		    updateTime();
		    scheduleUpdate();
		}, 1000);
	    }

	    element.on('$destroy', function() {
		$timeout.cancel(timeoutId);
	    });

	    scheduleUpdate();
	}

	return { link: link };
    });

