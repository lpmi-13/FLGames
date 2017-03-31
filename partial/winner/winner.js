angular.module('FLGames').controller('WinnerCtrl',function($scope, Teams){

  $scope.winner = Teams.winner;
  $scope.looser = Teams.looser;

  console.log($scope.winner);
  console.log($scope.winner[0]);
	if ($scope.winner.length == 0) { $scope.winner = false;}
  console.log($scope.looser);

  // var audioplayer_winner = document.getElementById('audio_winner');
  // audioplayer_winner.play();

});
