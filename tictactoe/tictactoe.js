angular.module('tictactoe', ['ui.bootstrap','ui.utils','ui.router','ngAnimate']);

angular.module('tictactoe').config(function($stateProvider) {

    $stateProvider
    .state('gameboard', {
      url: "/tictactoe/gameboard",
      templateUrl: "tictactoe/partial/gameboard/gameboard.html"
    })

    .state('winner', {
      url: "/tictactoe/winner",
      templateUrl: "tictactoe/partial/winner/winner.html"
    });

    /* Add New States Above */

});

