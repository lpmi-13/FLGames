angular.module('fight').controller('fightGameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, DialogService, gettext, gettextCatalog){

  $scope.questionToSave = $sce.trustAsHtml('');
	$scope.saved = [];
  $scope.audio_winner = document.getElementById('audio_winner');
	$scope.playersList = Teams.playersList;
	$scope.score01 = 0;
	$scope.score02 = 0;

  $scope.goHome = function() {
    var dialogOptions = {
        headerText: gettext('Go home?'),
        bodyText: gettext('Are you sure you want to go back home?'),
        callback: function () {
          $state.go('home');
        }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

  $scope.endGame = function() {
    var dialogOptions = {
      headerText: gettext('End game?'),
      bodyText: gettext('Are you sure you want to end the game?'),
      callback: function () {
				if ($scope.score01 > $scope.score02) {
					Teams.winner.push($scope.score01);
					Teams.winner.push($scope.score02);
				} else {
					if ($scope.score01 < $scope.score02) {
						Teams.looser.push($scope.score01);
						Teams.looser.push($scope.score02);
					} else { // A tie
					}
				}
        $state.go('winner', {gameId: 'fight'});
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

  $scope.addSentence = function() {
    // Init question
    $scope.question = false;
		$scope.questionStart = true;
  };
  
	$scope.close = function() {
		$scope.questionStart = false;
		$scope.questionToSave = '';
	}

	$scope.saveAnswer = function(good) {
		if ( good == 1 ) {
			$scope.questionToSave += " ⇒ Wrong !";
			$scope.score02++;
		} else {
			$scope.score01++;
		}
		$scope.saved.push($scope.questionToSave);
		$scope.close();
	};

	$scope.max = function(good) {
		if ( good == 1 ) {
			$scope.score02++;
		} else {
			$scope.score01++;
		}
	}

	$scope.min = function(good) {
		if ( good == 1 ) {
			$scope.score02--;
		} else {
			$scope.score01--;
		}
	}

	$scope.deleteSaved = function(index) {
		$scope.saved.splice(index, 1);
	};

});
