angular.module('soccer').controller('SoccerCtrl',function($scope, Teams, $stateParams){

  $scope.init = function() {
		$scope.showRules = false;
    // Disable selection
    if (typeof document.body.onselectstart !== "undefined") { //IE 
      document.body.onselectstart = function(){ return false; };
    } else if (typeof document.body.style.MozUserSelect !== "undefined") { //Firefox
      document.body.style.MozUserSelect = "none";
    } else { //All other ie: Opera
      document.body.onmousedown = function(){ return false; };
    }
    document.body.style.cursor = "default";
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
    $scope.classId = $stateParams.classId;
    if ($scope.classId !== '') {
      if (Teams.savedTeams && Teams.savedTeams.length === 0 || (Teams.savedTeams && Teams.savedTeams.length > 0 && Teams.savedTeams[0].class !== $scope.classId)) {
        $scope.playersList = [];
        for (var j=0; j<$scope.myClasses.length; j++) {
          if ($scope.myClasses[j]['class'] === $scope.classId) {
            $scope.playersList.push($scope.myClasses[j]);
          }
        }
        // Select 2 new teams
        Teams.draw(2, $scope.playersList);
      } else {
        $scope.playersList = Teams.savedTeams;
      }

      // Init data
      angular.forEach($scope.playersList, function(pupil) {
        pupil.yellow = 0;
        pupil.red = 0;
      });
      
      $scope.isSelected = true;
    } else {
      $scope.isSelected = false;
    }
  });

  $scope.orderProp = 'name';

  $scope.drawTeams = function() {
    Teams.draw(2, $scope.playersList);
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

});
