angular.module('FLGames', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'tictactoe', 'home', 'gettext', 'soccer', 'carrace', 'grammarGamble']);

angular.module('FLGames').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "home/partial/main/main.html"
    })

    .state('carrace', {
      url: "/carrace/:classId",
      templateUrl: "carrace/partial/gameboard/gameboard.html"
    })

    .state('soccer', {
      url: "/soccer/:classId",
      templateUrl: "soccer/partial/gameboard/gameboard.html"
    })

    .state('tictactoe', {
      url: "/tictactoe/:classId",
      templateUrl: "tictactoe/partial/gameboard/gameboard.html"
    })

    .state('grammarGamble', {
      url: "/grammarGamble/:classId",
      templateUrl: "grammarGamble/partial/gameboard/gameboard.html"
    })

    .state('gameboard', {
      url: "/gameboard/:gameId",
      templateUrl:  function ($stateParams){
        return $stateParams.gameId +'/partial/gameboard/gameboard.html';
      }
    })

    .state('winner', {
      url: "/winner/:gameId",
      templateUrl:  function ($stateParams){
        return $stateParams.gameId +'/partial/winner/winner.html';
      }
    });

    /* Add New States Above */
    $urlRouterProvider.otherwise('/home');

});

angular.module('FLGames').run(function($rootScope) {

    $rootScope.safeApply = function(fn) {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

});

angular.module('FLGames').run(function (gettextCatalog) {
    //gettextCatalog.currentLanguage = 'fr';
    //gettextCatalog.debug = true; // Write MISSING before missing translations
});
