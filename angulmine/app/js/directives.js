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
	    // Q: What do I have here?
	    // A: element: HTMLTableCellElement
	    //    attrs: an Object. Hmm...
	    //var msg = "element: " + element + "\n" + "Attributes:\n" + attrs + "\n";

	    // OK. This is the object that I care about.
	    // Where do I go from here?
	    // Ah. cell is actually a string. WTH?
	    var cell = attrs.mineCell;
	    // I think this was probably a mistake...but it gave me a good picture
	    // of what's going on. :-/
	    /*var plist = ''
	    for(var prop in cell) {
		plist += prop + ": " + cell[prop] + "\n";
	    }
	    var msg = plist;
	    alert(msg);*/

	    // Update element based upon cell's state:
	    var msg = '';
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

