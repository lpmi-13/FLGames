angular.module('FLGames', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'tictactoe', 'home', 'gettext']);

angular.module('FLGames').config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "home/partial/main/main.html"
    })

    .state('tictactoe', {
      url: "/tictactoe/:classId",
      templateUrl: "tictactoe/partial/main/main.html"
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
