'use strict';

describe('Minesweeper controllers', function(){
    beforeEach(module('minesweep.controllers'));

    describe('Initialization basics', function() {
	var scope, ctrl;

	beforeEach(inject(function( $rootScope, $controller) {
	    scope = $rootScope.$new();
	    ctrl = $controller('Game', {$scope: scope});
	}));

	it('should start off with no flags at time 0', inject(function() {
	    expect(scope.GetFlagCount()).toBe(0);
	    // This should be the current time...no real way to test it any more.
	    expect(scope.Time()).toBe(0);
	}));

	it('should build a board of the proper dimensions', inject(function() {
	    scope.NewGame(99, 101, 50);
	    var generatedBoard = scope.GetBoard();

	    var rowCount = 0;
	    for(var i=0; i<generatedBoard.length; i++) {
		var row = generatedBoard[i];
		expect(row.length).toBe(99);
		rowCount++;
	    }
	    expect(rowCount).toBe(101);
	}));
    });
});
