'use strict';


// Declare app level module which depends on filters, and services
angular.module('minesweepApp', [
    'ngRoute',
    'minesweepApp.filters',
    'minesweepApp.services',
    'minesweepApp.directives',
    'minesweep.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/play', {templateUrl: 'partials/playing.html', controller: 'Game'});
  $routeProvider.otherwise({redirectTo: '/play'});
}]);
