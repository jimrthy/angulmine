'use strict';

/* jasmine specs for controllers go here */

describe('Minesweeper controllers', function(){
  beforeEach(module('minesweep.controllers'));

  describe('Initialization basics', function() {
      var scope, ctrl;

      beforeEach(inject(function( $rootScope, $controller) {
	  //console.log("Look at me!!!");
	  scope = $rootScope.$new();
	  ctrl = $controller('Game', {$scope: scope});
	  //console.log("Scope: ", scope);
	  //console.log("Controller: ", ctrl);
      }));

      it('should start off with no flags at time 0', inject(function() {
	  expect(scope.flags).toBe(0);
	  expect(scope.time).toBe(0);
      }));

      describe('Build board', function() {
	  var generatedBoard;
	  beforeEach(function() {
	      console.log("Build Board Before Test:");
	      try {
		  scope.newGame(99, 101, 50);
	      }
	      catch(e) {
		  var msg = "Setting up a New Game failed: " + e.message;
		  //msg += e;
		  //console.log(e);
		  console.log(msg);

		  // It's almost a shame that there's no way to mark this entire piece of the
		  // test as a failure.
		  // Correction: it's a shame that I don't know the testing tools well enough
		  // yet to do so.
	      }
	      console.log("A");
	      generatedBoard = scope.board;
	      console.log('Running a test on board:');
	      console.log(generatedBoard);
	  });

	  it('should build a board with the proper number of mines', inject(function() {
	      var n = 0;

	      console.log("Getting ready to count all the mines in: ", generatedBoard);

	      for (var i=0; i<generatedBoard.length; i++) {
		  var row = generatedBoard[i];
		  for(var j=0; j<row.length; j++) {
		      if(row[j] == "bomb!") {
			  n++;
		      }
		  }
	      }

	      expect(n).toBe(50);
	  }));

	  it('should mark each square with the proper count of adjacent mines', inject(function() {
	      var countNeighboringbombs = function(board, x, y) {
		  // This is *very* similar to the way I'm dealing with setting up these
		  // numbers in the first place (c.f. populateBoard).
		  // Really should write this in a drastically
		  // different way.
		  // The important thing is that it isn't completely duplicated. I don't
		  // want to make the mistake of using code to test itself.
		  var n = 0;

		  var leftMostColumn = x==0;
		  var rightMostColumn = x+1 == board.length;
		  // Note that these assume a square grid. Which fits into pretty much
		  // everyone's expectations, but makes the actual problem a little less interesting.
		  var topRow = y==0;
		  var bottomRow = y+1 == board[x].length;

		  // Check for bombs to the left
		  if(!leftMostColumn) {
		      if(!topRow) {
			  if(scope.bombAt(board, x-1, y-1)) {
			      n++;
			  }
		      }
		      if(scope.bombAt(board, x-1, y)) {
			  n++;
		      }
		      if(!bottomRow) {
			  if(scope.bombAt(board, x-1, y+1)) {
			      n++;
			  }
		      }
		  }

		  // Bombs in this column
		  if(!topRow) {
		      if(scope.bombAt(board, x, y-1)) {
			  n++;
		      }
		  }
		  if(!bottomRow) {
		      if(scope.bombAt(board, x, y+1)) {
			  n++;
		      }
		  }

		  // Bombs in the right column
		  if(!rightMostColumn) {
		      if(!topRow) {
			  if(scope.bombAt(board, x+1, y-1)) {
			      n++;
			  }
		      }
		      if(scope.bombAt(board, x+1, y)) {
			  n++;
		      }
		      if(!bottomRow) {
			  if(scope.bombAt(board, x+1, y+1)) {
			      n++;
			  }
		      }
		  }

		  return n;
	      }

	      for (var i=0; i<generatedBoard.length; i++) {
		  var row = generatedBoard[i];
		  for (var j=0; j<row.length; j++) {
		      if(!scope.bombAt(i, j)) {
			  var neighboringBombsFound = countNeighboringBombs(generatedBoard, i, j);
			  expect(generatedBoard[i, j]).toBe(neighboringBombsFound);
		      }
		  }
	      }
	  }));

	  it('should build a board of the proper dimensions', inject(function() {
	      var rowCount = 0;
	      for(var i=0; i<generatedBoard.length; i++) {
		  var row = generatedBoard[i];
		  expect(row.length).toBe(101);
		  rowCount++;
	      }
	      expect(rowCount).toBe(99);
	  }));
      });
  });

  it('should ....', inject(function() {
    //spec body
  }));
});