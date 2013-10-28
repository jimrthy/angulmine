'use strict';

/* Controllers */

var mineControllers = angular.module('minesweep.controllers', ['minesweepApp.services']);

// Q: Does this make sense to move into a service?
// A: No.
// Then again, there doesn't seem to be any justification to keep it around at all.
// Except that I have something somewhere that relies on it. So it can't quite just go away.
// TODO: Make this go away.
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

	$scope.localModel = { start_time: false,
			      flag_count: 0,
			      finish_time: false
			    };
	$scope.$watch('localModel.flage_count');

	// Seems more than a little wrong that I need this.
	// Oh well.
	$scope.cached_board = {};
	$scope.$watch('cached_board', function(newValue, oldValue) {
	    console.debug("Change!");
	    }, true);


	$scope.NewGame = function(width, height, bombCount) {
	    minesweepApi.Fresh(width, height, bombCount);
	    // Can't start with a deep copy: some error about missing a push() method.
	    //angular.copy(minesweepApi.GetBoard(), $scope.cached_board);
	    // Shouldn't matter: we're getting a reference anyway.
	    $scope.cached_board = minesweepApi.GetBoard();

	    // Redundant the first time through. Oh well.
	    $scope.localModel.start_time = false;
	    $scope.localModel.finish_time = false;
	};
	
	// Getters/setters
	$scope.GetBoard = function() {
	    //return minesweepApi.GetBoard();
	    return $scope.cached_board;
	}
	$scope.GetStarted = function() {
	    return minesweepApi.GetStarted();
	}
	$scope.GetFlagCount = function() {
	    return $scope.localModel.flag_count;
	}
	/*$scope.IncrementFlags = function() {
	    $scope.localModel.flag_count++;
	}
	$scope.DecrementFlags = function() {
	    $scope.localModel.flag_count--;
	}*/
	$scope.BombCount = function() {
	    return minesweepApi.BombCount();
	}

	$scope.Time = function() {
	    var deltaInMillis = 0;
	    var msg = "";
	    if($scope.localModel.start_time) {
		msg += "Started at " + $scope.localModel.start_time + "\n";
		if($scope.localModel.finish_time) {
		    msg += "Finished at " + $scope.localModel.finish_time + "\n";
		    deltaInMillis = $scope.localModel.finish_time - $scope.localModel.start_time;
		}
		else {
		    var time = new Date();
		    msg += "Current Time: " + time + "\n";
		    deltaInMillis = time - $scope.localModel.start_time;
		}
	    }
	    msg += "Delta: " + deltaInMillis + "\n";
	    var result = Math.floor(deltaInMillis/1000);
	    //console.debug(msg);
	    return result;
	}

	$scope.BombAt = function(board, x, y) {
	    // FIXME: Is there any justification for this function's continued existence?
	    return minesweepApi.bombAt(board, x, y);
	}

	$scope.UnflaggedBombs = function() {
	    var bombCount = $scope.BombCount();
	    var flagCount =  $scope.GetFlagCount();
	    //console.log("UnflaggedBombs():\n\tTotal: " + bombCount + "\n\tFlags: " + flagCount);
	    return bombCount - flagCount;
	}

	// Utility
	$scope.onClick = function(cell) {
	    // We are definitely getting here...what's going wrong?
	    //console.log("Click!");

	    // Possibly start the timer
	    if(!$scope.localModel.start_time) {
		$scope.localModel.start_time = new Date();
		console.log("Starting playing at: " + $scope.localModel.start_time);
	    }

	    // TODO: Do something different depending on whether the player won or lost
	    var game_over = minesweepApi.Click(cell);
	    if(game_over) {
		$scope.localModel.finish_time = new Date();

		if('won' == game_over) {
		    alert("Congratulations! You won!");
		}
	    }
	}

	$scope.onRightClick = function(cell) {
	    /*console.debug("Here!");
	    console.debug("Toggling the flag at (" + cell.x + ", " + cell.y + ") from " + cell.flagged);*/
	    var flag = !cell.flagged;
	    // This should update board and bombCount also.
	    if(flag) {
		$scope.localModel.flag_count++;
	    }
	    else {
		$scope.localModel.flag_count--;
	    }
	    cell.flagged = flag;
	};

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
