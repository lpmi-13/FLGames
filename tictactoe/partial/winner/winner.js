angular.module('tictactoe').controller('WinnerCtrl',function($scope, Teams){

  $scope.winner = Teams.winner;
  $scope.looser = Teams.looser;

  // TODO : Get scores
  var audioplayer_winner = document.getElementById('audio_winner');
  audioplayer_winner.play();

});
