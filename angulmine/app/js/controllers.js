'use strict';

/* Controllers */

var mineControllers = angular.module('minesweep.controllers', []);

mineControllers.controller('Game', ['$scope',
    function($scope) {
	$scope.started = false;
	$scope.flags = 0;
	$scope.bombs = 0;
	$scope.time = 0;
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

	// Much more useful than something so short and simple looks.
	$scope.bombAt = function(board, x, y) {
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
		    // TODO: Really should dump out board's keys.
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
	    if(/*! $scope.bombAt(board, x, y)*/ true) {
		//console.log("Incrementing a neighbor at (", x, ", ", y, ")");
		// This next line seems to be failing miserably:
		//board[x, y] += 1;
		/*currentCount = board[x, y].neighboring_bombs;
		  board[x, y].neighboring_bombs = currentCount+1;*/
		board[x][y].neighboring_bombs++;
	    }
	}

	var incrementNeighborCounts = function(board, x, y) {
	    // There's a bomb at x,y. Warn the neighbors!
	    
	    // Details to increment neighbor counts.
	    // This sort of code is always annoying and contentious.
	    // There are few enough details that it doesn't seem worth
	    // trying to get fancy.

	    // Column to the left
	    if(x > 0) {
		if(y > 0) {
		    possiblyIncrement(board, x-1, y-1);
		}
		possiblyIncrement(board, x-1, y);
		if(y < board[x-1].length-1) {
		    possiblyIncrement(board, x-1, y+1)
		};		  
	    }

	    // Center column 
	    if(y > 0) {
		possiblyIncrement(board, x, y-1);
	    }
	    if(y < board[x].length-1) {
		possiblyIncrement(board, x, y+1);
	    }

	    // Right-hand column
	    if(x+1 < board.length) {
		if(y > 0) {
		    possiblyIncrement(board, x+1, y-1);
		}
		possiblyIncrement(board, x+1, y);
		if(y+1 < board[x+1].length) {
		    possiblyIncrement(board, x+1, y+1);
		}
	    }
	}

	$scope.prettyPrint = function(board) {
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
		    //console.log($scope.prettyPrint(blankBoard));
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
	    //console.log("Building a blank board");
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
	}

	$scope.tentativeClick = function(cell) {
	    // Kick off the game if it hasn't started already:
	    if(! $scope.started ) {
		$scope.started = time.now;
	    }

	    // If this square's already been revealed...we shouldn't actually get here.
	    // Except that a double-click should act as a click on all adjacent non-revealed
	    // squares that don't have flags.
	    // That's a double-click handler. Currently out of scope.

	    // Really should protect this square if it's flagged.

	    // If there's a bomb here, the game's over.

	    // If there is an adjacent bomb, reveal this square's count

	    // If there are no adjacent bombs, recursively click all hidden neighbors.
	    throw "Not Implemented Yet";
	}

	// Recommended by
	// http://stackoverflow.com/questions/15458609/angular-js-how-to-execute-function-on-page-load
	var init = function() {
	    $scope.newGame(8, 8, 10);
	}
	init();
    }]);
