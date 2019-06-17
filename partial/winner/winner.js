angular.module('FLGames').controller('WinnerCtrl',function($scope, Teams){

  $scope.winner = Teams.winner;
  $scope.looser = Teams.looser;

	if ($scope.winner.length === 0) {
    $scope.winner = false;
  }
});
