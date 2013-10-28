'use strict';

/* Directives */


var mod = angular.module('minesweepApp.directives', []).
    directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
	    elm.text(version);
	};
    }]);
mod.directive('mineCell', function() {
    return {

	dumpObject: function(o) {
	    // TODO: This really belongs in its own utility class.
	    // Actually, it should probably just be added to Object's prototype...
	    // Q: Does javascript support that sort of object fiddling?
	    var msg = '' + o + ' (a ' + typeof(o) + '):';
	    for(var prop in o) {
		msg += "\n\t" + prop + ": ";
		if(typeof(o[prop] != 'undefined')) {
		    msg += o[prop];
		}
		else {
		    msg += "Undefined";
		}
	    };
	    return msg;
	},

	debug: function(scope, element, attrs) {
	    var msg = "Performing a Directive on a Cell.";

	    // The scope isn't interesting...except that I might have to
	    // break down and extract the board state from it if I can't find
	    // it under either element or attrs.
	    /*msg += "\nScope:";
	      msg += dumpObject(scope.this);*/

	    // This is pretty useless...it looks like it boils down to
	    // [[HTMLSpanElement]] in my unit tests and an [[HTMLTableCellElement]] in practice.
	    // Meaning that I just might be forced to get the value of the cell being
	    // drawn here by digging into this part of the DOM.
	    msg += "\n\nElement:\n" + dumpObject(element[0]);

	    msg += "\n\nAttributes:\n";
	    msg += dumpObject(attrs);
	    console.debug(msg);
	},

	// Recommended approach from
	// http://stackoverflow.com/questions/14326077/angularjs-directives-not-working
	/*scope: {
	    someThing: '@',
	    onShow: '&'
	},*/
	// The idea behind that is that someThing is an attribute in the parent
	// element to watch.
	// onShow would be a function to call to do some sort of update.
	// Making the element look something like:
	//<div ng-something="something == foo" some-thing="{{someThing}}" on-show="displayFunction()"></div>
	// I'm not real clear on where ng-something comes into play.
    
	link: function(scope, element, attrs) {
	    // FIXME: Debug only
	    //debug(scope, element, attrs);

	    // CSS classes to customize the way the numbers look when revealed.
	    var revealedClasses = ['safe', 'neighbor1', 'neighbor2', 'neighbor3',
				  'neighbor4', 'neighbor5', 'neighbor6',
				  'neighbor7', 'neighbor8'];

	    attrs.$observe('mineCell',
			   function(newValue) {

			       // No, no, no!!
			       // attrs is a string!
			       //var cell = attrs.mineCell;
			       // Except when I set things up correctly.
			       /*var attr = attrs.mineCell;
			       var cell = {};
			       try {
				   cell = eval('('+attr+')');
			       }
			       catch(e) {
				   var s = "Error trying to eval the mineCell contents:\n";
				   s += "String: " + attr;
				   s += "\nError: " + e;
				   console.error(s);
			       }*/
			       // Back to dealing with a string (I think)
			       //var cell = newValue;
			       console.log("Switching to: " + newValue + " (a " + typeof(newValue) + ")");
			       var cell = {};
			       var failed = false;
			       try {
				   // Was originally pulling this from attr
				   cell = eval('('+ newValue +')');
			       }
			       catch(e) {
				   failed = true;
				   var s = "Error trying to eval the mineCell contents:\n";
				   s += "String: " + attr;
				   s += "\nError: " + e;
				   console.error(s);
			       }
			       if(!failed) {

				   // Update element based upon cell's state:
				   var msg = "Directing: " + cell + " (a " + typeof(cell) + ") at (" + cell.x + ", " + cell.y + ")\n";
				   var result = '&nbsp;';
				   //var result = 'X';

				   if(cell.hidden) {
				       msg += "Hidden cell\n";
				       if(cell.flagged) {
					   result = 'F';
					   msg += "Flagged Cell\n";
				       }
				   }
				   else {
				       msg += "Revealed cell: " + cell + "\n";
				       msg += "\tBomb: " + cell['bomb'] + "\n\tHidden: " + cell.hidden + "\n\tFlagged: "
					   + cell.flagged + "\n\tNeighboring Bombs: " + cell.neighboring_bombs
					   + "\n\tPosition: (" + cell.x + ", " + cell.y + ")\n\n";
				       if(cell.bomb) {
					   // Player just lost.
					   result = ':(';
					   msg += "Too bad. So sad.\n";
				       }
				       else {
					   if(!element.hasClass('hidden')) {
					       msg += "No hidden class...how can I verify which classes are available?\n";
					   }
					   // Q: Should this be applied to the attrs instead?
					   element.removeClass('hidden');
					   element.addClass(revealedClasses[cell.neighboring_bombs]);

					   if(cell.neighboring_bombs > 0) {
					       result = cell.neighboring_bombs;
					       msg += "Danger: " + result + "\n";

					       // No method addClass on a MineCell object.
					       //cell.addClass(revealedClasses[result]);
					   }
					   else {
					       msg += "Clear -- " + cell + "\n";
					   }
				       }
				   }
			       }

			       msg += "\nDirected cell at (" + cell.x + ", " + cell.y + "): '" + result + "'\n" + msg;
			       console.log(msg);
			       // Fails because there's no such method
			       //element.innerHTML(result);
			       // Doesn't work at all.
			       //element.innerHTML = result;
			       //element.innerText = result;
			       //element.innerText(result);
			       //element.text(result);
			       element.html(result);

			       //return result;
			   })}
    }
			   //return { link: link };
});

mod.directive('playTime', function($timeout) {
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
	    var display = scope.Time();
	    //console.debug("Updating time: " + display);
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

// Ripped off directly from 
// http://stackoverflow.com/questions/15731634/how-do-i-handle-right-click-events-in-angular-js
mod.directive('RightClick', function($parse) {
    return function(scope, element, attrs) {
	var fn = $parse(attrs.RightClick);
	element.bind('contextmenu', function(event) {
	    scope.$apply(function() {
		event.preventDefault();
		fn(scope, {$event:event});
	    });
	});
    };
});
