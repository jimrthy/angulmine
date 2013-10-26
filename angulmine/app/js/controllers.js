'use strict';

/* Controllers */

var mineControllers = angular.module('minesweep.controllers', []);

mineControllers.factory('time', function($timeout) {
    var time = {};

    (function tick() {
	time.now = new Date();
	$timeout(tick, 1000);
    })();
    return time;
});

mineControllers.controller('Game', ['$scope', 'time', 'minesweepApi',
    function($scope, time, minesweepApi) {
	/*
	// TODO: Put the model into its own object.
	$scope.started = false;
	$scope.flags = 0;
	$scope.bombs = 0;
	$scope.time = time;
	$scope.board = [];
	*/
	$scope.getBoard = function() {
	    return minesweepApi.GetBoard();
	}
	$scope.getStarted = function() {
	    return minesweepApi.GetStarted();
	}
	$scope.getFlagCount = function() {
	    return minesweepApi.GetFlagCount();
	}
	$scope.incrementFlags = function() {
	    minesweepApi.IncrementFlags();
	}
	$scope.decrementFlags = function() {
	    minesweepApi.DecrementFlags();
	}
	$scope.bombCount = function() {
	    return minesweepApi.BombCount();
	}
	$scope.time = function() {
	    return minesweepApi.GetTime();
	}

	$scope.bombAt = function(board, x, y) {
	    return model.bombAt(board, x, y);
	}

	$scope.prettyPrint = function(board) {
	    // For when something goes horribly wrong.
	    console.log("Pretty printing");

	    var delimeter = "*****************************************************\n";
	    var result = delimeter;
	    board.forEach(function(row) {
		console.log (".");
		result += "[";
		try {
		    row.forEach(function(column) {
			//console.log("Appending: " + JSON.stringify(column));
			try {
			    var ch = ''
			    if(column.bomb) {
				ch = '!';
			    }
			    else {
				ch = column.neighboring_bombs;
			    }
			    result += " " + ch;
			}
			catch (e) {
			    console.log("Have something illegal...well, somewhere");
			    // Try this for grins:
			    console.log(column);
			}
		    });
		}
		catch(e) {
		    console.log("Failed to iterate over a row in the board. Problem data:");
		    console.log(row);
		}
		result += "]\n";
	    });
	    result += delimeter;

	    console.log("Getting ready to print the board:");
	    //console.log(result);
	    return result;
	}


	$scope.onClick = function(cell) {
	    // We are definitely getting here...what's going wrong?
	    //console.log("Click!");
	    minesweepApi.Click(cell);
	}

	// Recommended by
	// http://stackoverflow.com/questions/15458609/angular-js-how-to-execute-function-on-page-load
	var init = function() {
	    $scope.newGame(8, 8, 10);
	}
	init();
    }]);
