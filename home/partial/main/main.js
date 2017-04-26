angular.module('home').controller('MainCtrl',function($scope, Teams, $state, $stateParams, gettextCatalog){

  $scope.allGames = [
    {id:'tictactoe', name:'TicTacToe', nbTeams:2, maxTeams:0},
    {id:'soccer', name:'Soccer', nbTeams:2, maxTeams:0},
    {id:'carrace', name:'Car race', nbTeams:6, maxTeams:8},
    {id:'grammarGamble', name:'Grammar Gamble', nbTeams:2, maxTeams:0},
    {id:'fight', name:'Writing Fight', nbTeams:1, maxTeams:0},
    {id:'alphabet', name:'Alphabet Game', nbTeams:2, maxTeams:0}
  ];

	$scope.setDefaultParams = function() {
		$scope.mainParams = { // Default parameters
			selectedClass: false,
			gameId: 'tictactoe',
			gameName: 'Tictactoe',
			pupils: [
				{ name:'',
					active:1,
					team:0},
				{ name: '',
					active: 0,
					team:1
				}
			],
			nbTeams: 2,
			maxTeams: 0
		};
    $scope.orderProp = 'name';
	};
	$scope.setDefaultParams();

  $scope.getNumber = function(num) {
    return new Array(num);   
  };

  $scope.setNbGroups = function(nb) {
    $scope.mainParams.nbTeams = nb;
		$scope.drawTeams(nb);
  };

  $scope.lang = ['en', 'fr'];

  $scope.currentLanguage = gettextCatalog.currentLanguage;
  $scope.setLanguage = function(lang) {
    gettextCatalog.currentLanguage = lang;
    $scope.currentLanguage = lang;
  };

  Teams.load('data/myClasses.txt').then( function(result) {
    $scope.myClasses = JSON.parse(result);

    // Build group names
    $scope.allGroups = [];
    for (var i=0; i<$scope.myClasses.length; i++) {
      // New group or already there?
      if ($scope.allGroups.indexOf($scope.myClasses[i]['class']) === -1) {
        if ($scope.myClasses[i]['class'] !== '') {
          $scope.allGroups.push($scope.myClasses[i]['class']);
        }
      }
    }
		
    // Test if a class is already selected (from URL) or already saved
    // $scope.classId = $stateParams.classId;
    // if ($scope.classId !== '') {
    //   if (Teams.savedTeams && Teams.savedTeams.length === 0 || (Teams.savedTeams && Teams.savedTeams.length > 0 && Teams.savedTeams[0].class !== $scope.classId)) {
    //     $scope.playersList = [];
    //     for (var j=0; j<$scope.myClasses.length; j++) {
    //       if ($scope.myClasses[j]['class'] === $scope.classId) {
    //         $scope.playersList.push($scope.myClasses[j]);
    //       }
    //     }
    //     // Select 2 new teams
    //     Teams.draw(2, $scope.playersList);
    //   } else {
    //     $scope.playersList = Teams.savedTeams;
    //   }

    //   $scope.isSelected = true;
    // } else {
    //   $scope.isSelected = false;
    // }
		$scope.isSelected = false;
  });

	$scope.drawTeams = function(nb) {
    Teams.draw(nb, $scope.playersList);
	};
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.playersList, function(pupil) {
      count += pupil.absent ? 0 : 1;
    });
    return count;
  };

  $scope.switchOrder = function(order) {
    $scope.orderProp = order;
  };

	$scope.selectMyClass = function(item) {
		if (item != 'no-class') {
			$scope.playersList = Teams.selected(item, $scope.myClasses);
			$scope.isSelected = true;
			// Prepare class list
			$scope.mainParams.selectedClass = item;
			$scope.mainParams.pupils = item.pupils;
			if ($scope.mainParams.nbTeams != 0) {
				$scope.teams = $scope.drawTeams($scope.mainParams.nbTeams, $scope.mainParams.pupils);
			}
		} else { // No class selected, back to defaults
			$scope.setDefaultParams();
			$scope.isSelected = false;
			// $scope.teams = Teams.draw($scope.mainParams.nbTeams, $scope.mainParams.pupils);
		}
		return false;
	};

	$scope.selectGame = function(activity) {
		$scope.mainParams.gameId = activity.id;
		$scope.mainParams.gameName = activity.name;
		$scope.mainParams.maxTeams = activity.maxTeams; 
		$scope.mainParams.nbTeams = activity.nbTeams; 
		$scope.drawTeams(activity.nbTeams);
	};

	$scope.startGame = function(activity) {
		$state.go(activity);
	};
});
