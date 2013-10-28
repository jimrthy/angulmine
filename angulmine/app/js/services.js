'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var services = angular.module('minesweepApp.services', []);

// At least one person on StackOverflow managed to break things by declaring the module twice.
// Getting rid of the version service does not help in the slightest.
services.value('version', '0.1');

services.factory('minesweepApi', function() {
    // At least one example I ran across online has this returning a
    // factory function that can then be called to get the service
    // values. That seems like a great idea, but it doesn't seem to
    // help with the fundamental issue.
	var model = { //started: false,
		      bombs: 0,
		      //time: new Date(),
		      board: [] };

	model.GetBoard = function() {
	    // Q: Do I need to do an angular.copy?
	    // At least one stackoverflow answer implied that I most definitely do.
	    // A: It seems pretty definitely not. I'm not sure why that article
	    // recommended it...it's just about creating a deep copy
	    // of my 2-d array of cells.
	    // I most definitely want to pass around a reference that can
	    // be updated using angular's data binding.
	    // TODO: look into why this was recommended.
	    // If nothing else, I didn't understand the use case there.

	    // This next line causes some serious conniptions.
	    //return angular.copy(model.board);
	    // Model changes don't get propagated to the view using this next approach.
	    return model.board;
	};
	model.BombCount = function() {
	    return model.bombs;
	};

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
	    // This has to be built up rotated 90 degrees, because of
	    // the way tables are laid out.
	    for(var i=0; i<height; i++) {
		var row = [];
		for(var j=0; j<width; j++) {
		    var cell = {bomb: false,
				hidden: true,
				flagged: false,
				neighboring_bombs: 0,
				// Location: makes the onClick handler much more convenient.
				x: j,
				y: i};
		    row.push(cell);
		}
		board.push(row);
	    }
	    return board;
	}

	model.bombAt = function(board, x, y) {
	    // Does board have a bomb at position (x,y)?
	    // Doesn't particularly need to be a member of the model.
	    // Honestly, it should be a function on board instead.
	    var result;

	    try {
		result = board[y][x].bomb;
	    }
	    catch(e) {
		var msg = "";
		try {
		    var rows = board.length;
		    if(y >= rows) {
			msg += "Trying to access row " + y + " out of " + (rows+1);
		    }
		    else
		    {
			var row = board[y];
			try {
			    var width = row.length;
			    if(x >= width) {
				msg += "Trying to access column " + x + " out of " + (width+1);
			    }
			    else {
				msg += "Failed to access the bomb member from the cell at (" + x + ", " + y + ")."
				msg += "\nout of (" + width + ", " + rows + ")\nValue: ";
				if(row[x]) {
				    msg += row[x];
				    // Of course, this next access is precisely what got us into trouble in the first place.
				    msg += "\nwhich should be exactly the same memory reference as: " + board[y][x];
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

	model.pickBombLocations = function(width, height, bombCount)
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
		board[y][x].neighboring_bombs++;
	    }
	}

	var visitNeighbors = function(board, x, y, f) {
	    // Helper function. Apply f to each cell that borders (x, y) in board.
	    //console.log("Visiting the neighbors of the cell at (" + x + ", " + y + ")");
	    
	    // Column to the left
	    if(x > 0) {
		if(y > 0) {
		    f(board, x-1, y-1);
		}
		f(board, x-1, y);
		if(y < board.length-1) {
		    f(board, x-1, y+1)
		};		  
	    }

	    // Center column 
	    if(y > 0) {
		f(board, x, y-1);
	    }
	    if(y < board.length-1) {
		f(board, x, y+1);
	    }

	    // Right-hand column
	    if(x+1 < board[y].length) {
		if(y > 0) {
		    f(board, x+1, y-1);
		}
		f(board, x+1, y);
		if(y+1 < board.length) {
		    f(board, x+1, y+1);
		}
	    }
	}

	var incrementNeighborCounts = function(board, x, y) {
	    // There's a bomb at x,y. Warn the neighbors!
	    visitNeighbors(board, x, y, possiblyIncrement);
	}

	model.populateBoard = function(blankBoard, bombLocations) {
	    // Put a bomb on the board. Increment the count of each neighbor (if it isn't also a bomb)
	    // Making this public because it definitely seems worth unit testing.

	    // Very much called for its side-effects on blankBoard.
	    // Just for reference, I really dislike doing this sort of thing.

	    bombLocations.forEach(function(loc) {
		var x = loc.x, y = loc.y;

		if(model.bombAt(blankBoard, x, y)) {
		    console.log("Oops");
		    throw { message: "Shuffle failed",
			    board: blankBoard,
			    location: loc,
			    bombs: bombLocations };
		};

		// Updating blankBoard in place like this is BAD!
		// But expedient. This is definitely a 'fix it later' sort of thing.
		// Especially since, at this point, I'm really just simulating
		// what would actually be happening on the server.
		blankBoard[y][x].bomb = true;

		incrementNeighborCounts(blankBoard, x, y);
	    });
	}

	model.Fresh = function(width, height, bombCount) {
	    // Kick off a new game.

	    // Absolutely called for side-effects.
	    console.log("Building a blank " + width + "x" + height + " board with " + bombCount + " bombs");
	    var playingField = buildBlankBoard(width, height);
	    //console.log("Initial Playing Field:");
	    //console.log(playingField);

	    //console.log("Picking bomb locations");
	    var bombLocations = model.pickBombLocations(width, height, bombCount);
	    //console.log("Bombs at:");
	    //console.log(bombLocations);

	    model.populateBoard(playingField, bombLocations);
	    //console.log("New Game: ");
	    //console.log(playingField);
	    model.board = playingField;
	    model.bombs = bombCount;
	}

	var ClickCellLocation = function(board, x, y) {
	    var cell = board[y][x];
	    return model.Click(cell);
	}

    model.SafeReveal = function(board, x, y) {
	// A non-bomb square was clicked. If it was hidden, show what was behind it.
	var cell = model.board[y][x];
	if(cell.hidden) {
	    cell.hidden = false;

	    // If there are no adjacent bombs, recursively click all hidden neighbors.
	    if(0 == cell.neighboring_bombs) {
		visitNeighbors(board, x, y, model.SafeReveal);
	    }
	    else {
		console.log(cell.neighboring_bombs + " bombs next door to (" + x + ", " + y + ")");
	    }
	}
    }

    var CheckForWinner = function(board) {
	var result = '';

	if(board.every(function(row) {
	    return row.every(function(cell) {
		// If a non-bomb cell is hidden, the player
		// hasn't won.
		// If a bomb cell gets revealed, the player loses,
		// but that's easier to check for right at the top
		// of the click event.
		return !cell.hidden || cell.bomb;
	    });
	})) {
	    result = 'won';
	}
	return result;
    }

    model.Click = function(cell) {
	// Returns false if the game's still going.
	// 'dead!' if the user clicked on a bomb
	// 'won' if all non-bomb squares have been revealed.
	var result = false;

	// If this square's already been revealed...we shouldn't actually get here.
	// Except that a double-click should act as a click on all adjacent non-revealed
	// squares that don't have flags.
	// That's a double-click handler. Currently out of scope.
	if(cell.hidden) {

	    // Reveal!
	    if (!cell.flagged) {

		console.log("Revealing hidden cell: (" + cell.x + ", " + cell.y +")");

		// If there's a bomb here, the game's over.
		if(cell.bomb) {
		    alert("You lose!");

		    // This can be a painful way to start the game...but at least you get
		    // to see where you would have gone wrong.
		    // Reveal every cell in the board.
		    model.board.forEach(function(row) {
			row.forEach(function(cell) {
			    cell.hidden = false;
			})
		    });
		    result = 'dead!';
		}
		else {
		    // Woohoo! Clear stuff!

		    // Show the cell (and maybe its neighbors)
		    model.SafeReveal(model.board, cell.x, cell.y);

		    // Is the player a winner?
		    result = CheckForWinner(model.board);
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
	
	return result;
    }

    return model;
});
