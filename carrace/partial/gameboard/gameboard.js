angular.module('carrace').controller('CarraceGameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, $timeout, DialogService, gettext, gettextCatalog){

  // Set teams
  $scope.logoList = ['carrace/media/img/f1.png', 'carrace/media/img/beetle_01.png', 'carrace/media/img/bike.png', 'carrace/media/img/2cv.png', 'carrace/media/img/4x4.png', 'carrace/media/img/car.png', 'carrace/media/img/tractor_01.png', 'carrace/media/img/motorbike_01.png','carrace/media/img/truck.png', 'carrace/media/img/scooter.png', 'carrace/media/img/mini.png', 'carrace/media/img/police_car.png', 'carrace/media/img/monster_truck.png', 'carrace/media/img/bus_02.png', 'carrace/media/img/vintage_02.png'];
  $scope.negatives = ['work', 'breakdown', 'traffic', 'redlight', 'flat', 'fuel', 'accident', 'policeman'];
  $scope.positives = ['speed', 'downhill', 'highway', 'escort'];
  //$scope.mainParams.nbTeams = 7; // debug
  $scope.audio_klaxon = document.getElementById('audio_klaxon');
  $scope.audio_start = document.getElementById('audio_car_start');
  $scope.audio_tick = document.getElementById('audio_tick');

  $scope.gameTeams = [];

  for (var i=0; i<2; i++) {
    if (Teams.savedTeams.length > 0 ) {
      //$scope.gameTeams.push({'name': 'Team '+i, 'score':0, 'winner':false, 'players': $filter('filter')(Teams.savedTeams, {'team':i}), scorers: []});
      $scope.gameTeams.push({die: '', negative: false, positive: false,'logo': $scope.logoList[i], 'name': 'Team '+i, 'score':0, left: 0, selected: false, 'winner':false, 'players': $filter('filter')(Teams.savedTeams, {'team':i})});
      
    } else {
      //$scope.gameTeams.push({'name': 'Team '+i, 'score':0, 'winner':false, 'players': [{'team':i, name:''}], scorers:[]});
      $scope.gameTeams.push({die: '', negative: false, positive: false,'logo': $scope.logoList[i], 'name': 'Team '+i, 'score':0, left: 0, selected: false, 'winner':false, 'players': [{'team':i}]});
    }
  }

  $scope.init = function() {
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

});
