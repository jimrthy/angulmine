'use strict';

/* Controllers */

var mineControllers = angular.module('minesweep.controllers', []);

mineControllers.controller('Game', ['$scope',
    function($scope) {
      $scope.flags = 0;
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
		  row.push(0);
	      }
	      board.push(row);
	  }
	  return board;
      }

      // Much more useful than something so short and simple looks.
      $scope.bombAt = function(board, x, y) {
	  return board[x, y] == 'bomb!';
      }

      var pickBombLocations = function(width, height, bombCount)
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
	  // If board doesn't have a bomb at (x,y), increment the count
	  if(! $scope.bombAt(board, x, y)) {
	      //console.log("Incrementing a neighbor at (", x, ", ", y, ")");
	      // This next line seems to be failing miserably:
	      //board[x, y] += 1;
	      currentCount = parseInt(board[x, y]);
	      board[x, y] = currentCount+1;
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
			  result += " " + column;
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
	  console.log(result);
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
		  console.log($scope.prettyPrint(blankBoard));
		  throw { message: "Shuffle failed",
			  board: blankBoard,
			  location: loc,
			  bombs: bombLocations };
	      };

	      // Updating blankBoard in place like this is BAD!
	      // But expedient. This is definitely a 'fix it later' sort of thing. 
	      blankBoard[x, y] = 'bomb!';

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
	  var bombLocations = pickBombLocations(width, height, bombCount);
	  console.log("Bombs at:");
	  //console.log(bombLocations);

	  $scope.populateBoard(playingField, bombLocations);
	  console.log("New Game: ");
	  //console.log(playingField);
	  $scope.board = playingField;
      }

      $scope.tentativeClick = function(x, y) {
	  // If this square's already been revealed...we shouldn't actually get here.
	  // Except that a double-click should act as a click on all adjacent non-revealed
	  // squares that don't have flags.

	  // Really should protect this square if it's flagged.

	  // If there's a bomb here, the game's over.

	  // If there is an adjacent bomb, reveal this square's count

	  // If there are no adjacent bombs, recursively click all hidden neighbors.
	  throw "Not Implemented Yet";
      }
  }]);

