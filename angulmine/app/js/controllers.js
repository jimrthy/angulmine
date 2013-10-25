'use strict';

/* Controllers */

var mineControllers = angular.module('minesweep.controllers', []);

mineControllers.
  controller('Game', [function($scope) {
      $scope.flags = 0;
      $scope.time = 0;

      var buildBlankBoard = function(width, height) {
	  // Initialize an empty playing field
	  board = [];
	  for(var i=0; i<width; i++) {
	      var row = [];
	      for(var j=0; j<height; j++) {
		  row.push(0);
	      }
	      board.push(row);
	  }
	  return board;
      }

      var shuffle = function(vals)
      {
	  // Shamelessly stolen from http://www.merlyn.demon.co.uk/js-shufl.htm#FnB
	  // (who stole it from Knuth)
	  // N.B.: This is an in-place shuffle.
	  var J, K, t;
	  for (J=vals.length-1; J>0; J--)
	  {
	      K = Random(J+1);
	      T = vals[J];
	      vals[J] = vals[K];
	      vals[K] = T;
	  }
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
		  indexes.push([i,j]);
	      }
	  }

	  shuffle(indexes);

	  // return the first n:
	  return indexes.slice(0, bombCount);
      }

      $scope.newGame = function(width, height, bombCount) {
	  var blankBoard = buildBlankBoard(width, height);

	  var bombLocations = pickBombLocations(width, height, bombCount);
	  
      }

      $scope.tentativeClick = function(x, y) {
	  }
  }]);

