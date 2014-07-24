angular.module('home').controller('MainCtrl',function($scope, gettextCatalog){

  $scope.allGames = [
    {id:'tictactoe', name:'TicTacToe'},
    {id:'soccer', name:'Soccer'},
    {id:'race', name:'Car race'}
  ];

  $scope.lang = ['en', 'fr'];

  $scope.currentLanguage = gettextCatalog.currentLanguage;
  $scope.setLanguage = function(lang) {
    gettextCatalog.currentLanguage = lang;
    $scope.currentLanguage = lang;
  };

});
