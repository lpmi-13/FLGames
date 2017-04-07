angular.module('alphabet').controller('alphabetGameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, $timeout, DialogService, gettext, gettextCatalog){

	$scope.data = 'A B C D E F G H I J K L M N O P Q R S T U V W Y';
	$scope.alphabet = $scope.data.split(" ");
  $scope.gameTeams = [];
  $scope.currentPlayers = [];
	$scope.history = [];
	$scope.selectedEl = '';
	if (Teams.savedTeams) {
		$scope.playersList = Teams.savedTeams;
	}

  $scope.init = function() {
		// Set teams
		for (var i=0; i<2; i++) {
			if (Teams.savedTeams.length > 0 ) {
				$scope.gameTeams.push({'name': 'Team '+i, 'score':0, 'winner':false, 'players': $filter('filter')(Teams.savedTeams, {'team':i})});
			} else {
				$scope.gameTeams.push({'name': 'Team '+i, 'score':0, 'winner':false, 'players': [{'team':i, name:''}]});
			}
		}

    // Disable selection
    if (typeof document.body.onselectstart !== "undefined") { //IE 
      document.body.onselectstart = function(){ return false; };
    } else if (typeof document.body.style.MozUserSelect !== "undefined") { //Firefox
      document.body.style.MozUserSelect = "none";
    } else { //All other ie: Opera
      document.body.onmousedown = function(){ return false; };
    }
    document.body.style.cursor = "default";

		// Prepare board game
		$scope.board = [
			[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))],
			[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))],
			[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))],
			[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))]
		];
  };

	$scope.pick = function ($data) {
		var randomnumber = Math.floor(Math.random()*$data.length);
		var $picked = $data[randomnumber];
		$scope.alphabet.splice(randomnumber, 1);
		return $picked;
	}

	$scope.mixLetters = function() {
		var dialogOptions = {
			headerText: gettext('Mix letters?'),
			bodyText: gettext('Are you sure you want to generate a new grid ?'),
			callback: function () {
				$scope.alphabet = $scope.data.split(" ");
				if ($scope.selectedEl) { $scope.selectedEl.selected = false; }
				for (var i=0; i<$scope.history.length; i++) {
					$scope.history[i].done = false;
				}
				// Prepare board game
				$scope.board = [
					[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))],
					[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))],
					[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))],
					[$sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet)), $sce.trustAsHtml($scope.pick($scope.alphabet))]
				];
				$scope.history = '';
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
	}

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
				if ($scope.gameTeams[0].score > $scope.gameTeams[1].score) {
					Teams.winner.push($scope.gameTeams[0]);
					Teams.looser.push($scope.gameTeams[1]);
				} else {
					if ($scope.gameTeams[0].score < $scope.gameTeams[1].score) {
						Teams.looser.push($scope.gameTeams[1]);
						Teams.winner.push($scope.gameTeams[0]);
					} else { // A tie
					}
				}
        $state.go('winner', {gameId: 'alphabet'});
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

	$scope.selectLetter = function(e, row, col) {
		if ($scope.selectedEl) { 
			$scope.selectedEl.selected = false;
			if ($scope.selectedEl != e && $scope.board[row][col] != '') {
				e.selected = !e.selected;
				$scope.selectedEl = e;
				$scope.selectedEl.row = row;
				$scope.selectedEl.col = col;
			}
		} else {
				e.selected = !e.selected;
				$scope.selectedEl = e;
				$scope.selectedEl.row = row;
				$scope.selectedEl.col = col;
		}
	}

	$scope.selectPlayer = function(nb) {
		// Reset players active state
		for (var i=0; i<$scope.gameTeams[0].players.length; i++) {
			$scope.gameTeams[0].players[i].active = 1;
		}
		for (var i=0; i<$scope.gameTeams[1].players.length; i++) {
			$scope.gameTeams[1].players[i].active = 1;
		}
		// Pick nb random players in each team
    if ( Teams.savedTeams.length > 0) {
			Teams.drawPlayers($scope.gameTeams[0].players, nb);
			Teams.drawPlayers($scope.gameTeams[1].players, nb);
    }
	}

	$scope.max = function(team) {
		$scope.gameTeams[team].score++;
		if ($scope.selectedEl) {
			$scope.history.push($scope.selectedEl);
			$scope.selectedEl.done = true;
			$scope.board[$scope.selectedEl.row][$scope.selectedEl.col] = $sce.trustAsHtml('');
			$scope.selectedEl.selected = false;
		}
	}

	$scope.minus = function(team) {
		$scope.gameTeams[team].score--;
	}
});
