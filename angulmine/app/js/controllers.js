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

mineControllers.controller('Game', ['$scope', 'time',
    function($scope, time) {
	// TODO: Put the model into its own object.
	$scope.started = false;
	$scope.flags = 0;
	$scope.bombs = 0;
	$scope.time = time;
	$scope.board = [];

	var Random = function(top) {
	    // Returns a random integer from [0, top)
	    var seed = Math.random();
	    return Math.floor(seed * top);
	}

	var shuffle = function(vals)
	{
	    // Shamelessly stolen from http://www.merlyn.demon.co.uk/js-shufl.htm#FnB
	    // (who stole it from Knuth)
	    // N.B.: This is an in-place shuffle.
	    // Probably worth adding it to this so it can be unit tested.
	    var J, K, T;
	    for (J=vals.length-1; J>0; J--)
	    {
		K = Random(J+1);
		T = vals[J];
		vals[J] = vals[K];
		vals[K] = T;
	    }
	}
	
	var buildBlankBoard = function(width, height) {
	    // Initialize an empty playing field
	    // TODO: This is, realistically, worth turning into its own object.
	    // If nothing else, this is where the bombAt function really should live.
	    var board = [];
	    for(var i=0; i<width; i++) {
		var row = [];
		for(var j=0; j<height; j++) {
		    var cell = {bomb: false,
				hidden: true,
				flagged: false,
				neighboring_bombs: 0,
				// Location: makes the onClick handler much more convenient.
				x: i,
				y: j};
		    row.push(cell);
		}
		board.push(row);
	    }
	    return board;
	}

	$scope.bombAt = function(board, x, y) {
	    // Does board have a bomb at position (x,y)?
	    var result;
	    
	    try {
		result = board[x][y].bomb;
	    }
	    catch(e) {
		var msg = "";
		try {
		    var cols = board.length;
		    if(x >= cols) {
			msg += "Trying to access column " + x + " out of " + board.length+1;
		    }
		    else
		    {
			var row = board[x];
			try {
			    var height = row.length;
			    if(y >= height) {
				msg += "Trying to access row " + y + " out of " + row.length+1;
			    }
			    else {
				msg += "Failed to access the bomb member from the cell at (" + x + ", " + y + ")."
				msg += "\nout of (" + cols + ", " + height + ")\nValue: ";
				if(row[y]) {
				    msg += row[y];
				    msg += "\nwhich should be exactly the same memory reference as: " + board[x][y];
				}
				else {
				    msg += "missing";
				}
			    }
			}
			catch(ex1) {
			    // TODO: Refactor this into its own debugging method
			    var propList="";
			    if (typeof(row) != "undefined") {
				for(var propName in row) {
				    if(typeof(row[propName] != "undefined")) {
					propList += (propName + ": " + row[propName] + "\n");
				    }
				    else {
					propList += (propName + ": undefined\n");
				    }
				}
				msg += "Row at " + x + ":\n\t" + propList;
			    }
			    else
			    {
				msg += "Row at " + x + " is undefined\n";
				msg += "Playing Board:\n'" + board + "'";
			    }
			    msg += "\n" + ex1;
			}
		    }
		}
		catch(ex) {
		    msg += "Apparently I've gotten something completely bogus into here. Looks like board has no length\n";
		    msg += "Internal exception: " + ex;
		    // TODO: Really should dump out board's prototype and value.
		}
		console.log(msg);
		throw e;
	    }
	    return result;
	}

	$scope.pickBombLocations = function(width, height, bombCount)
	{
	    // Get the indexes
	    // Yes, it would be more efficient to do this at the
	    // same time as initializing the playing field.
	    // It would also be tougher to read and maintain.
	    var indexes = [];
	    for (var i=0; i<width; i++) {
		for(var j=0; j<height; j++) {
		    indexes.push({x: i, y: j});
		}
	    }

	    shuffle(indexes);
	    
	    // return the first n:
	    return indexes.slice(0, bombCount);
	}

	var possiblyIncrement = function(board, x, y) {
	    // Position x,y has a bomb next to it. Increment that count.
	    // Was originally checking against
	    // This is mostly just crap that should go away...as soon as
	    // I'm confident that the board's at least vaguely what I want.
	    if(/*! $scope.bombAt(board, x, y)*/ true) {
		//console.log("Incrementing a neighbor at (", x, ", ", y, ")");
		// This next line seems to be failing miserably:
		//board[x, y] += 1;
		/*currentCount = board[x, y].neighboring_bombs;
		  board[x, y].neighboring_bombs = currentCount+1;*/
		board[x][y].neighboring_bombs++;
	    }
	}

	var visitNeighbors = function(board, x, y, f) {
	    // Helper function. Apply f to each cell that borders (x, y) in board.
	    console.log("Visiting the neighbors of the cell at (" + x + ", " + y + ")");

	    // Column to the left
	    if(x > 0) {
		if(y > 0) {
		    f(board, x-1, y-1);
		}
		f(board, x-1, y);
		if(y < board[x-1].length-1) {
		    f(board, x-1, y+1)
		};		  
	    }

	    // Center column 
	    if(y > 0) {
		f(board, x, y-1);
	    }
	    if(y < board[x].length-1) {
		f(board, x, y+1);
	    }

	    // Right-hand column
	    if(x+1 < board.length) {
		if(y > 0) {
		    f(board, x+1, y-1);
		}
		f(board, x+1, y);
		if(y+1 < board[x+1].length) {
		    f(board, x+1, y+1);
		}
	    }
	}

	var incrementNeighborCounts = function(board, x, y) {
	    // There's a bomb at x,y. Warn the neighbors!
	    visitNeighbors(board, x, y, possiblyIncrement);
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

	$scope.populateBoard = function(blankBoard, bombLocations) {
	    // Put a bomb on the board. Increment the count of each neighbor (if it isn't also a bomb)
	    // Making this public because it definitely seems worth unit testing.

	    // Very much called for its side-effects on blankBoard.
	    // Just for reference, I really dislike doing this sort of thing.

	    bombLocations.forEach(function(loc) {
		var x = loc.x, y = loc.y;

		if($scope.bombAt(blankBoard, x, y)) {
		    console.log("Oops");
		    throw { message: "Shuffle failed",
			    board: blankBoard,
			    location: loc,
			    bombs: bombLocations };
		};

		// Updating blankBoard in place like this is BAD!
		// But expedient. This is definitely a 'fix it later' sort of thing. 
		//blankBoard[x][y] = 'bomb!';
		blankBoard[x][y].bomb = true;

		incrementNeighborCounts(blankBoard, x, y);
	    });
	}

	$scope.newGame = function(width, height, bombCount) {
	    // Absolutely called for side-effects.
	    console.log("Building a blank board");
	    var playingField = buildBlankBoard(width, height);
	    //console.log("Initial Playing Field:");
	    //console.log(playingField);

	    //console.log("Picking bomb locations");
	    var bombLocations = $scope.pickBombLocations(width, height, bombCount);
	    //console.log("Bombs at:");
	    //console.log(bombLocations);

	    $scope.populateBoard(playingField, bombLocations);
	    //console.log("New Game: ");
	    //console.log(playingField);
	    $scope.board = playingField;
	    $scope.bombs = bombCount;

	    // Kill the timer (until the sucker clicks the first button)
	    $scope.started = false;
	}

	var clickCellLocation = function(board, x, y) {
	    var cell = board[x][y];
	    return $scope.tentativeClick(cell);
	}

	$scope.tentativeClick = function(cell) {
	    // We're getting here...what's going wrong?
	    //console.log("Click!");

	    // If this square's already been revealed...we shouldn't actually get here.
	    // Except that a double-click should act as a click on all adjacent non-revealed
	    // squares that don't have flags.
	    // That's a double-click handler. Currently out of scope.
	    if(cell.hidden) {

		// Kick off the game if it hasn't started already:
		if(! $scope.started ) {
		    $scope.started = new Date();
		    console.log("Starting new game at: " + $scope.started);
		}

		// Now things get interesting
		// Really should protect this square if it's flagged.
		if (!cell.flagged) {

		    console.log("Revealing hidden cell: (" + cell.x + ", " + cell.y +")");
		    cell.hidden = false;

		    // If there's a bomb here, the game's over.
		    if(cell.bomb) {
			alert("You lose!");
			// This can be a painful way to start the game...but at least you get
			// to see where you would have gone wrong.
			$scope.started = false;
			// Reveal every cell in the board.
			// FIXME: Why isn't this propagating?
			$scope.board.forEach(function(row) {
			    row.forEach(function(cell) {
				cell.hidden = false;
			    })
			});
		    }
		    else {
			// If there are no adjacent bombs, recursively click all hidden neighbors.
			if(0 == cell.neighboring_bombs) {
			    visitNeighbors($scope.board, cell.x, cell.y, clickCellLocation);
			}
			else {
			    console.log(cell.neighboring_bombs + " bombs next door");
			}
		    }
		}
		else {
		    console.log("Cell (" + cell.x + ", " + cell.y + ") has been flagged");
		    // If the user clicked on a cell with a flag...assume it was a mistake
		    // TODO: Really ought to add some sort of warning animation
		}
	    }
	    else {
		// Odds are, this is recursion at work.
		console.log("Why'd you click a revealed cell? (" + cell.x + ", " + cell.y + ")");
		console.log(cell);
	    }
	}

	// Recommended by
	// http://stackoverflow.com/questions/15458609/angular-js-how-to-execute-function-on-page-load
	var init = function() {
	    $scope.newGame(8, 8, 10);
	}
	init();
    }]);
