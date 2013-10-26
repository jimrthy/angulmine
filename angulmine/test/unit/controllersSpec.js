'use strict';

describe('Minesweeper controllers', function(){
  beforeEach(module('minesweep.controllers'));

    // FIXME: Almost all of this needs to move into servicesSpec

  describe('Initialization basics', function() {
      var scope, ctrl;

      beforeEach(inject(function( $rootScope, $controller) {
	  scope = $rootScope.$new();
	  ctrl = $controller('Game', {$scope: scope});
      }));

      it('should start off with no flags at time 0', inject(function() {
	  expect(scope.getFlags).toBe(0);
	  // This should be the current time...no real way to test it any more.
	  expect(scope.getTime).not.toBe(0);
      }));

      describe('Select bomb locations', function() {
	  it('should fill a 10x10 square', inject(function() {
	      var locs = scope.pickBombLocations(10, 10, 100);
	      expect(locs.length).toBe(100);

	      for(var i=0; i<100; i++)
	      {
		  var loc = locs[i];
		  for(var j=i+1; j<100; j++)
		  {
		      expect(loc).not.toBe(locs[j]);
		  }
	      }
	  }));

	  it('should do interesting things with a 100x100 square', inject(function() {
	      var locs = scope.pickBombLocations(100, 100, 100);
	      expect(locs.length).toBe(100);

	      for(var i=0; i<100; i++)
	      {
		  var loc = locs[i];
		  for(var j=i+1; j<100; j++)
		  {
		      expect(loc).not.toBe(locs[j]);
		  }
	      }
	  }));
      });

      describe('Build taller board', function() {
	  var generatedBoard;
	  beforeEach(function() {
	      try {
		  // TODO: Duplicate this, but with the dimensions flipped.
		  scope.newGame(99, 101, 50);
	      }
	      catch(e) {
		  var msg = "Setting up a New Game failed: " + e.message;
		  //msg += e;
		  console.log(msg);

		  // It's almost a shame that there's no way to mark this entire piece of the
		  // test as a failure if we get here.
		  // Correction: it's a shame that I don't know the testing tools well enough
		  // yet to do so.
	      }
	      generatedBoard = scope.board;
	  });

	  it('should build a board with the proper number of mines', inject(function() {
	      var n = 0;

	      //console.log("Getting ready to count all the mines in: ", generatedBoard);
	      for (var i=0; i<generatedBoard.length; i++) {
		  var row = generatedBoard[i];
		  for(var j=0; j<row.length; j++) {
		      if(row[j].bomb) {
			  n++;
		      }
		  }
	      }

	      expect(n).toBe(50);
	  }));

	  it('should mark each square with the proper count of adjacent mines', inject(function() {
	      // This test is *slow*. Should probably be moved to e2e.
	      // Even though, technically, it's still just a unit test.
	      var countNeighboringBombs = function(board, x, y) {
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

	      //console.log("Start verifying neighbor counts");
	      var failed = false;
	      for (var i=0; i<generatedBoard.length; i++) {
		  var row = generatedBoard[i];
		  for (var j=0; j<row.length; j++) {
		      try {
			  if(!scope.bombAt(generatedBoard, i, j)) {
			      var neighboringBombsFound = countNeighboringBombs(generatedBoard, i, j);
			      expect(generatedBoard[i, j]).toBe(neighboringBombsFound);
			  }
		      }
		      catch(e) {
			  var msg = "Failed checking for bomb at position (" + i + ", " + j + "). ";
			  msg += "\nException: " + e;
			  msg += "\nContinuing just because this is so ridiculous";
			  console.log(msg);
			  failed = true;
		      }
		  }
	      }
	      expect(failed).toBe(false);
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
});
