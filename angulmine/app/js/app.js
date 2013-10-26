'use strict';


// Declare app level module which depends on filters, and services
angular.module('minesweepApp', [
  'ngRoute',
    // Really should either use these or delete them
    'minesweepApp.filters',
    /*'myApp.services',
  'myApp.directives',*/
  'minesweep.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/play', {templateUrl: 'partials/playing.html', controller: 'Game'});
  $routeProvider.otherwise({redirectTo: '/play'});
}]);
