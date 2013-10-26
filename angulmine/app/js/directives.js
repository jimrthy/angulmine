'use strict';

/* Directives */


angular.module('minesweepApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
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

