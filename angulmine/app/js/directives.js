'use strict';

/* Directives */


angular.module('minesweepApp.directives', []).
    directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
	    elm.text(version);
	};
    }]).
    directive('mineCell', function() {
	function link(scope, element, attrs) {
	    var msg = "Performing a Directive on a Cell.\nScope:";
	    for(var prop in scope.this) {
		if(prop != '$new' && prop != 'constructor') {
		    msg += "\n\t" + prop + ": ";
		    if(typeof(scope[prop]) != 'undefined') {
			msg += scope[prop];
		    }
		    else {
			msg += "Undefined";
		    }
		}
		else {
		    msg += "\tconstructor: a big function for setting up a really nifty object";
		}
	    }

	    // This is pretty useless...it looks like it boils down to
	    // [[HTMLSpanElement]]
	    msg += "\n\nElement:\n" + element;

	    // And this seems to be a duplication of the root scope.
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

	    var cell = attrs.mineCell;

	    // Update element based upon cell's state:
	    var msg = "Directing: " + cell+ "\n";
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
	    msg = "Directed cell at (" + cell['x'] + ", " + cell['y'] + "): " + result + "\n" + msg;
	    console.log(msg);
	    element.text(result);
	}
	return { link: link };
    }).
    directive('playTime', function($timeout) {
	function link(scope, element, attrs) {
	    // Pulled almost line-by-line from http://docs.angularjs.org/guide/directive
	    var timeoutId;

	    function updateTime() {
		var display = 0;
		if(scope.started) {
		    var current = new Date();
		    display = Math.floor ((current - scope.started) / 1000);
		}
		element.text(display);
	    }

	    function scheduleUpdate() {
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

