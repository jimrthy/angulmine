'use strict';

/* Controllers */

var mineControllers = angular.module('minesweep.controllers', ['minesweepApp.services']);

// Q: Does this make sense to move into a service?
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
	// Initialization
	//$scope.api = minesweepService.minesweepApi();
	//$scope.api = minesweepApi();

	$scope.localModel = { start_time: false,
			      flag_count: 0,
			      finish_time: false
			    };

	$scope.NewGame = function(width, height, bombCount) {
	    minesweepApi.Fresh(width, height, bombCount);
	    // Redundant the first time through. Oh well.
	    $scope.localModel.start_time = false;
	    $scope.localModel.finish_time = false;
	};
	
	// Getters/setters
	$scope.GetBoard = function() {
	    return minesweepApi.GetBoard();
	}
	$scope.GetStarted = function() {
	    return minesweepApi.GetStarted();
	}
	$scope.GetFlagCount = function() {
	    return $scope.localModel.flag_count;
	}
	$scope.IncrementFlags = function() {
	    $scope.localModel.flag_count++;
	}
	$scope.DecrementFlags = function() {
	    $scope.localModel.flag_count--;
	}
	$scope.BombCount = function() {
	    return minesweepApi.BombCount();
	}

	$scope.Time = function() {
	    var result = 0;
	    if($scope.localModel.start_time) {
		if($scope.localModel.finish_time) {
		    result = $scope.localModel.finish_time - $scope.localModel.start_time;
		}
		else {
		    var deltaInMillis = time - $scope.localModel.start_time;
		    result = Math.Floor(deltaInMills/1000);
		}
	    }
	    return result;
	}

	$scope.BombAt = function(board, x, y) {
	    // FIXME: Is there any justification for this function's continued existence?
	    return minesweepApi.bombAt(board, x, y);
	}

	$scope.UnflaggedBombs = function() {
	    var bombCount = $scope.BombCount();
	    return bombCount - $scope.localModel.flagCount;
	}

	// Utility
	$scope.onClick = function(cell) {
	    // We are definitely getting here...what's going wrong?
	    console.log("Click!");

	    // Possibly start the timer
	    if(!$scope.localModel.start_time) {
		$scope.localModel.start_time = time;
		console.log("Starting playing at: " + $scope.localModel.start_time);
	    }
	    var game_over = minesweepApi.Click(cell);
	    if(game_over) {
		$scope.localModel.finish_time = time;
	    }
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

	// Kick things off with a fresh Basic level board
	// Recommended by
	// http://stackoverflow.com/questions/15458609/angular-js-how-to-execute-function-on-page-load
	var init = function() {
	    $scope.NewGame(8, 8, 10);
	}
	init();
    }]);
