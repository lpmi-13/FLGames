/* jshint loopfunc: true */

angular.module('carrace').controller('CarraceGameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, $timeout, DialogService, gettext, gettextCatalog){

  //$scope.question = false;
  $scope.question = $sce.trustAsHtml('');
  $scope.showAnswer = false;
  $scope.selectedTopic = false;
  $scope.winner = false;
  $scope.newGame = true;
  $scope.started = false;
  // Set teams
  $scope.logoList = ['carrace/media/img/f1.png', 'carrace/media/img/beetle_01.png', 'carrace/media/img/bike.png', 'carrace/media/img/2cv.png', 'carrace/media/img/4x4.png', 'carrace/media/img/car.png', 'carrace/media/img/tractor_01.png', 'carrace/media/img/motorbike_01.png','carrace/media/img/truck.png', 'carrace/media/img/scooter.png', 'carrace/media/img/mini.png', 'carrace/media/img/police_car.png', 'carrace/media/img/monster_truck.png', 'carrace/media/img/bus_02.png', 'carrace/media/img/vintage_02.png'];
  $scope.negatives = ['work', 'breakdown', 'traffic', 'redlight', 'flat', 'fuel', 'accident', 'policeman'];
  $scope.positives = ['speed', 'downhill', 'highway', 'escort'];
  $scope.transition = 'left 2s ease-in';
  $scope.audio_klaxon = document.getElementById('audio_klaxon');
  $scope.audio_start = document.getElementById('audio_car_start');
  $scope.audio_tick = document.getElementById('audio_tick');

  $scope.gameTeams = [];

  // Build starting vehicles
  if (Teams.savedTeams.length > 0 ) {
    var highest = (Math.max.apply(this,$.map(Teams.savedTeams, function(o){ return o.team; }))) + 1;
    $scope.nbGroups = highest;
  } else {
    $scope.nbGroups = 2;
  }
  for (var i=0; i<$scope.nbGroups; i++) {
    if (Teams.savedTeams.length > 0 ) {
      $scope.gameTeams.push({die: '', negative: false, positive: false,'logo': $scope.logoList[i], 'name': 'Team '+i, 'score':0, left: 0, selected: false, 'winner':false, 'players': $filter('filter')(Teams.savedTeams, {'team':i})});
      
    } else {
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
    Teams.winner = [];
    Teams.looser = [];
    //console.log(Teams.looser);
  };

  // Load data
  Data.get('carrace/data/myData.txt').then( function(result) { 
    $scope.questions = JSON.parse(result); 
    //console.log($scope.questions);
    
    // Build topic list
    $scope.allTopics = [];
    for (var i=0; i<$scope.questions.length; i++) {
      // New topic or already there?
      if ($scope.allTopics.indexOf($scope.questions[i]['topic']) === -1) {
        if ($scope.questions[i]['topic'] !== '') {
          $scope.allTopics.push($scope.questions[i]['topic']);
        }
      }
    }
  });
  
  $scope.selectTopic = function(topic) {
    // Filter selected questions
    $scope.selectedTopic = $filter('filter')($scope.questions, {'topic': topic});
  };

  $scope.close = function() {
    //$scope.question = false;
    //$scope.questionAnswer = false;
    $scope.question = $sce.trustAsHtml('');
    $scope.questionAnswer = $sce.trustAsHtml('');
    $timeout.cancel($scope.qTime);
    $scope.questionTimer = false;
    $scope.stopButton = false;
  };

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
  
  $scope.myAlert = function() {
    var dialogOptions = {
      headerText: gettext('Are you sure?'),
      bodyText: gettext('Do you really want to quit the game and go back to configuration page?'),
      callback: function () {
        if ($scope.gameTeams[0].players[0].class) {
          $state.go('carrace', {classId : $scope.gameTeams[0].players[0].class });
        } else {
          $state.go('carrace');
        }
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

  $scope.drawQuestion = function() {
    if  ($scope.selectedTopic === false) {
      var dialogOptions = {
        closeButtonText: 'Ok',
        actionButtonText: '',
        headerText: gettext('No topic!'),
        bodyText: gettext('You need to select a topic before starting the game.')
      };
      DialogService.showModalDialog({}, dialogOptions);
    } else {
      $scope.started = true;
      // Init question
      $scope.question = false;
      $scope.questionAnswer = false;
      $scope.questionTimer = false;
      $scope.showAnswer = false;
      $scope.stopButton = false;
      var questionParts = [];

      // Pick a random question
      // TODO ? Copy selectedTopic and delete selected question to avoid repetition / Restart if copy is empty
      var randQuestion = $scope.selectedTopic[Math.floor(Math.random()*$scope.selectedTopic.length)].question;
      // Parse selected question for timer and answer
      questionParts = randQuestion.split('::');
      if (questionParts[1]) {
        $scope.questionAnswer = $sce.trustAsHtml(questionParts[1]);
      } else {
        $scope.questionAnswer = '---';
      }
      if (questionParts[2]) {
        $scope.questionTimer = questionParts[2];
      } else {
        $scope.questionTimer = 60; // Default : 60 seconds
      }
      $scope.audio_start.play();
      $timeout( function() {
        $scope.question = $sce.trustAsHtml(questionParts[0]); // Trigger question display
        $scope.stopButton = true;
        // Start timer
        $scope.qTime = $scope.launchTimer($scope.questionTimer);
      }, 3000);
    }
  };

  $scope.launchTimer = function(seconds) {
    $scope.questionTimer = seconds;
    if ($scope.questionTimer > 0) {
      if ($scope.questionTimer < 6) {
        $scope.audio_tick.play();
      }
      $scope.qTime = $timeout( function() { $scope.launchTimer($scope.questionTimer-1); }, 1000 );
    } else {
      // Timer ended : Play klaxon !
      $scope.audio_klaxon.play();
      $scope.stopTimer();
    }
  };

  $scope.stopTimer = function() {
    $timeout.cancel($scope.qTime);
    $scope.questionTimer = 0;
    $scope.audio_klaxon.play();
    $scope.stopButton = false;
  };

  function getRandom(minVal, maxVal) {
    var randNum = Math.ceil((Math.random()*parseInt(maxVal-minVal))+minVal);
    return randNum;
  }

  $scope.throwDie = function(nb_time) {
    // Display counter in front of each selected runner
    var selectedTeams = $filter('filter')($scope.gameTeams, {selected:true});
    if ( selectedTeams.length > 0) {
      angular.forEach(selectedTeams, function(team) {
        if (team.negative) {
          switch (team.negative) {
            case 'breakdown' : team.die = getRandom(0,2); break;
            case 'work' : team.die = getRandom(1,6); break;
            case 'accident' : team.die = getRandom(0,5); break;
            case 'fuel' : team.die = getRandom(0,4); break;
            case 'traffic' : team.die = getRandom(1,8); break;
            case 'redlight' : team.die = getRandom(0,2); break;
            case 'flat' : team.die = getRandom(0,3); break;
            case 'policeman' : team.die = 0; break;
            default : team.die = getRandom(1,20);
          }
        } else if (team.positive) {
          switch (team.positive) {
            case 'speed' : team.die = getRandom(18,24); break;
            case 'highway' : team.die = getRandom(19,25); break;
            case 'downhill' : team.die = getRandom(20,25); break;
            case 'escort' : team.die = getRandom(24,27); break;
            default : team.die = getRandom(1,20);
          }
        } else {
          team.die = getRandom(1,20);
        }
      });
      var stop = $timeout( function() {
        if (nb_time > 0) {
          nb_time--;
          $scope.throwDie(nb_time);
        } else {
          $timeout.cancel(stop);
          // Move runners
          $scope.move();
        }
      }, 200);
    }
  };

  $scope.move = function() {
    var selectedTeams = $filter('filter')($scope.gameTeams, {selected:true});
    var audioplayer_move = document.getElementById('audio_move');
    audioplayer_move.play();
    // Gradual animation to test winner
    var keepGoing = true;
    for (var i=1; i<5; i++) {
      if (keepGoing) {
      angular.forEach(selectedTeams, function(team) {
        team.selected = false;
        if (keepGoing) {
          var step = Math.round((team.die*8)/4);
          team.left += step;
          if ($scope.checkWinner(team)) {
            keepGoing = false;
            team.die = '';
            team.negative = false;
            team.positive = false;
            $scope.finalScore();
          } else {
            if (i === 4) {
              $timeout( function() {
                team.die = '';
                team.negative = false;
                team.positive = false;
              }, 2500);
            }
          }
        }
      });
      }
    }
  };

  $scope.moveStep = function(team, keepGoing) {
    team.selected = false;
    if (keepGoing) {
      var step = Math.round((team.die*8)/4);
      team.left += step;
      if ($scope.checkWinner(team)) {
        keepGoing = false;
        team.die = '';
        team.negative = false;
        team.positive = false;
        $scope.finalScore();
      } else {
        if (i === 4) {
          $timeout( function() {
            team.die = '';
            team.negative = false;
            team.positive = false;
          }, 2500);
        }
      }
    }
  };

  $scope.checkWinner = function(team) {
    // img width = 100px (runners)
    if (team.left > 870-100) {
      team.winner = true;
      $scope.winner = true;
      return true;
    } else {
      return false;
    }
  };

  $scope.setSpeed = function() {
    var selectedTeams = $filter('filter')($scope.gameTeams, {selected:true});
    angular.forEach(selectedTeams, function(team) {
      team.speed = !team.speed;
      team.selected = false;
    });
  };

  $scope.setNegative = function() {
    var selectedTeams = $filter('filter')($scope.gameTeams, {selected:true});
    angular.forEach(selectedTeams, function(team) {
      team.positive = false;
      team.negative = false;
      // Pick a random negative bonus
      var picked = $scope.negatives[Math.floor(Math.random() * $scope.negatives.length)];
      team.negative = picked;
      team.selected = false;
    });
  };

  $scope.setPositive = function() {
    var selectedTeams = $filter('filter')($scope.gameTeams, {selected:true});
    angular.forEach(selectedTeams, function(team) {
      team.positive = false;
      team.negative = false;
      // Pick a random negative bonus
      var picked = $scope.positives[Math.floor(Math.random() * $scope.positives.length)];
      team.positive = picked;
      team.selected = false;
    });
  };

  $scope.randomBonus = function() {
    // TODO : Add animations to decide on gifts
    // Reset all bonus before applying new ones
    angular.forEach($scope.gameTeams, function(team) {
      team.positive = false;
      team.negative = false;
    });
    var randBonus;
    // Pick a random nb of teams to add bonus to (at least 1)
    var randNbTeam = Math.floor(Math.random() * $scope.gameTeams.length);
    if (randNbTeam === 0) { randNbTeam = 1; }
    for (var i=0; i<randNbTeam; i++) {
      // Pick a random team
      var randTeam = $scope.gameTeams[Math.floor(Math.random() * $scope.gameTeams.length)];
      // Pick a random positive or negative bonus 
      var randType = Math.floor(Math.random()*2);
      switch (randType) {
        case 0 : 
          randBonus = $scope.positives[Math.floor(Math.random() * $scope.positives.length)];
          randTeam.positive = randBonus;
          break;
        case 1 : 
          randBonus = $scope.negatives[Math.floor(Math.random() * $scope.positives.length)];
          randTeam.negative = randBonus;
          break;
      }
    }
  };

  $scope.mixTeams = function() {
    var dialogOptions = {
        headerText: gettext('Mix vehicles?'),
        bodyText: gettext('Are you sure you want to change all vehicles?'),
        callback: function () {
          // Work on a copy of logos
          var copyLogos = angular.copy($scope.logoList);
          angular.forEach($scope.gameTeams, function(team) {
            var num = Math.floor(Math.random() * copyLogos.length);
            var tempLogo =  copyLogos.splice(num, 1);
            team.logo = tempLogo[0];
          });
        }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

  $scope.finalScore = function() {
    // Record final winning team
    //Teams.winner = $scope.winner;
    angular.forEach($scope.gameTeams, function(team) {
      if (team.winner === false) {
        Teams.looser.push(team);
      } else {
        Teams.winner = team;
      }
    });

    // Throw dialog passing winner values
    $timeout( function() {
      $state.go('winner', {gameId: 'carrace'});
    }, 2500);

  };

});
