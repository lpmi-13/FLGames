angular.module('soccer').controller('soccerGameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, $timeout, DialogService, gettext, gettextCatalog){

  $scope.ball = {'posX': 355, 'posY': 230};
  $scope.morePasses = 2;
  $scope.question = $sce.trustAsHtml('');
  $scope.showAnswer = false;
  $scope.selectedTopic = false;
  $scope.gameTeams = [];
  $scope.currentPlayer = [];
  $scope.activePlayers = [];
  for (var i=0; i<2; i++) {
    if (Teams.savedTeams.length > 0 ) {
      $scope.gameTeams.push({'name': 'Team '+i, 'score':0, 'winner':false, 'players': $filter('filter')(Teams.savedTeams, {'team':i}, true), scorers: []});
    } else {
      $scope.gameTeams.push({'name': 'Team '+i, 'score':0, 'winner':false, 'players': [{'team':i, name:''}], scorers:[]});
    }
  }
  $scope.audio_referee = document.getElementById('audio_referee');
  $scope.audio_cheer = document.getElementById('audio_cheer');
  $scope.audio_cheer02 = document.getElementById('audio_cheer02');
  $scope.audio_winner = document.getElementById('audio_winner');
  $scope.audio_tick = document.getElementById('audio_tick');
  
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

  // Load data
  Data.get('data/soccer-data.txt').then( function(result) { 
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
		$scope.allTopics.sort();
  });

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
          $state.go('soccer', {classId : $scope.gameTeams[0].players[0].class });
        } else {
          $state.go('soccer');
        }
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

  $scope.endGame = function() {
    var dialogOptions = {
      headerText: gettext('End game?'),
      bodyText: gettext('Are you sure you want to end the game?'),
      callback: function () {
        $scope.finalScore();
        $state.go('winner', {gameId: 'soccer'});
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

  $scope.drawQuestion = function() {
    // Init question
    //$scope.questionStart = false;
    //$scope.question = false;
    $scope.close();
    $scope.questionAnswer = false;
    $scope.questionTimer = false;
    $scope.showAnswer = false;
    //$scope.stopButton = true;
    var questionParts = [];

    // Pick a random question
    // TODO ? Copy selectedTopic and delete selected question to avoid repetition / Restart if copy is empty
    $scope.questionStart = true;
    var randQuestion = $scope.selectedTopic[Math.floor(Math.random()*$scope.selectedTopic.length)].question;
		// Parse selected question to get rid of eventual answer (for the moment)
		questionParts = randQuestion.split('::');
		// if (questionParts[1]) {
		// 	$scope.questionAnswer = $sce.trustAsHtml(questionParts[1]);
		// } else {
		// 	$scope.questionAnswer = '---';
		// }
		// if (questionParts[2]) {
		// 	$scope.questionTimer = questionParts[2];
		// } else {
		// 	$scope.questionTimer = 60; // Default : 60 seconds
		// }

    // Pick a random player in each team
    $scope.selectPlayer();

    $timeout( function() {
      $scope.question = $sce.trustAsHtml(questionParts[0]); // Trigger question display
    }, 3000);
  };
  
  $scope.selectTopic = function(topic) {
    // Filter selected questions
    $scope.selectedTopic = $filter('filter')($scope.questions, {'topic': topic}, true);
    console.log($scope.selectedTopic);
    var length = $scope.selectedTopic.length;
  };

  $scope.close = function() {
    $scope.question = $sce.trustAsHtml('');
    $scope.questionStart = false;
  };
  
  $scope.playerWin = function(team) {
    // Random number of passes
    $scope.gameTeams[team].nbPasses = Math.floor(Math.random() * 3);
    // Prepare player's name for first pass
    $scope.currentSelectedPlayer = $scope.currentPlayer[team];
    $scope.displayName = true;
    // Close question div
    $scope.close();
    // Throw pass
    $timeout( function() { $scope.passBall(team); }, 500);
  };

  $scope.passBall = function(team) {
    $scope.audio_cheer.play();
    $scope.goal = false;
    
    // Test if a goal is possible
    $scope.testGoal(team);
    // Pick a random player from team
    // TODO? Keep history and avoid repetition of same player
    $scope.currentSelectedPlayer = Teams.drawPlayers($scope.gameTeams[team].players, 1)[0];

    if (!$scope.goal) { // No goal : pass the ball from 1 to 3 times
          // Random pass : long or short (minimun 20px)
          var randX = Math.floor(Math.random() * 60)+20;
          var randY = Math.floor(Math.random() * (440-20)+20);
          //console.log(randX+'-'+randY);
          switch (team) {
            case 0:
              $scope.ball.posX += randX;
              break;
            case 1:
              $scope.ball.posX -= randX;
              break;
          }
          $scope.ball.posY = randY;
          $scope.animBall = !$scope.animBall;
          $scope.transition = 'all 1.5s ease-out';
          if ($scope.transform === 'rotate(360deg)') {
            $scope.transform = 'rotate(-360deg)';
          } else {
            $scope.transform = 'rotate(360deg)';
          }
          if ($scope.gameTeams[team].nbPasses > 0) {
            $scope.gameTeams[team].nbPasses = $scope.gameTeams[team].nbPasses-1;
            $timeout( function() { $scope.passBall(team); }, 1000);
          } else {
            $timeout( function() { $scope.displayName = false; }, 1500);
          }
    } else { //Goal
      $scope.animShoot(team);
    }
    return false;
  };

  $scope.animShoot = function(team) {
    $scope.audio_cheer02.play();
    var randX, randY;
    switch(team) {
      case 0 :
        randX = 750;
        randY = 230;
        break;
      case 1 :
        randX = -25;
        randY = 230;
        break;
    }
    $scope.ball.posX = randX;
    $scope.ball.posY = randY;
    $scope.shootBall = true;
    $scope.transition = 'all 0.5s ease';
    $scope.transform = 'scale(0.7,0.7)';
    $timeout( function() {$scope.animGoal(team);}, 500);
  };

  $scope.animGoal = function(team) {
    $scope.shootBall = false;
    $scope.goal = false;
    $scope.gameTeams[team].score++;
    $scope.gameTeams[team].scorers.push($scope.scorer.name);
    $scope.ball.posX = 355;
    $scope.ball.posY = 230;
    $scope.transform = 'scale(1,1)';
  };
  
  $scope.testGoal = function(team) {
    switch(team) {
      case 0:
        if ($scope.ball.posX > 600) {
          // Get ready to score for team 0
          $scope.goal = true;
          $scope.scorer = $scope.currentSelectedPlayer;
          $scope.displayName = false;
          return true;
        }
        break;
      case 1:
        if ($scope.ball.posX < 100) {
          // Get ready to score for team 1
          $scope.goal = true;
          $scope.scorer = $scope.currentSelectedPlayer;
          $scope.displayName = false;
          return true;
        }
        break;
    }

    if ($scope.goal === true) {
      $scope.animShoot(team);
    }
    return false;
  };

  $scope.launchTimer = function(seconds) {
    if ($scope.timer) { // Cancel previous timer if set
      $timeout.cancel($scope.timer);
      $scope.timer = false;
    }
    $scope.myTimer = seconds;
    if ($scope.myTimer > 0) {
      $scope.timer = $timeout( function() {
        $scope.launchTimer($scope.myTimer-1);
      }, 1000 );
      if ($scope.myTimer < 5) {
        $scope.audio_tick.play();
      }
    } else {
      $scope.audio_referee.play();
      $scope.endGame();
    }
  };
  
  $scope.pauseResume = function(seconds) {
    if ($scope.timer) { // Cancel previous timer if set
      $timeout.cancel($scope.timer);
      $scope.timer = false;
      $scope.myTimer = seconds;
    } else {
      $scope.launchTimer(seconds);
    }
  };

  $scope.finalScore = function() {
    // Test final winning team
    if ( $scope.gameTeams[0].score > $scope.gameTeams[1].score ) {
      $scope.winner = $scope.gameTeams[0];
      Teams.winner = $scope.gameTeams[0];
      Teams.looser = $scope.gameTeams[1];
    } else if ( $scope.gameTeams[0].score < $scope.gameTeams[1].score ) {
      $scope.winner = $scope.gameTeams[1];
      Teams.winner = $scope.gameTeams[1];
      Teams.looser = $scope.gameTeams[0];
    } else {
      $scope.winner = false; // A tie
    }	
  };

  $scope.setFoul = function(team, pupil) {
    var oppTeam;
    var dialogOptions = {};
    switch(team) {
      case 0: oppTeam = 1; break;
      case 1: oppTeam = 0; break;
    }
    if (pupil.red === 1) { //Init cards (in case of mistakes)
      pupil.yellow = 0;
      pupil.red = 0;
    } else if (pupil.yellow === 1) { // Switch to red card
      pupil.red = 1;
      dialogOptions = {
        headerText: gettext('Red card!'),
        bodyText: gettext('Free kick for the opposite team.'),
        closeButtonText: gettext('No'),
        actionButtonText: gettext('Play the free kick'),
        callback: function () {
          $scope.currentSelectedPlayer = Teams.drawPlayers($scope.gameTeams[team].players, 1)[0];
          $scope.playerWin(oppTeam);
        }
      };
      DialogService.showModalDialog({}, dialogOptions);
    } else { // Add yellow card
      pupil.yellow = 1;
      dialogOptions = {
        headerText: gettext('Yellow card!'),
        bodyText: gettext('Free kick for the opposite team.'),
        closeButtonText: gettext('No'),
        actionButtonText: gettext('Play the free kick'),
        callback: function () {
          $scope.currentSelectedPlayer = Teams.drawPlayers($scope.gameTeams[team].players, 1)[0];
          $scope.playerWin(oppTeam);
        }
      };
      DialogService.showModalDialog({}, dialogOptions);
    }
  };

  $scope.selectPlayer = function() {
    $scope.audio_referee.play();
    // Pick a random player in each team
    if ( Teams.savedTeams.length === 0) { // No class selected
      // Generic player, no name
      $scope.currentPlayer[0] = $scope.gameTeams[0].players[0];
      $scope.currentPlayer[0].name = 'Team 01';
      $scope.currentPlayer[1] = $scope.gameTeams[1].players[0];
      $scope.currentPlayer[1].name = 'Team 02';
    } else {
      // Team 0
      // Get active players
      $scope.activePlayers[0] = $filter('filter')(Teams.savedTeams, { team:0, active:1}, true);
      if ( $scope.activePlayers[0].length > 1) { // Pick a player among active
        $scope.currentPlayer[0] = Teams.drawPlayers($scope.activePlayers[0], 1)[0];
      } else { // Not enough players left : re-activate all players and pick 1
        angular.forEach($scope.gameTeams[0].players, function(player) {
            player.active = 1;
        });
        $scope.activePlayers[0] = $filter('filter')(Teams.savedTeams, { team:0, active:1}, true);
        $scope.currentPlayer[0] = Teams.drawPlayers($scope.activePlayers[0], 1)[0];
      }
      // Team 1
      // Get active players
      $scope.activePlayers[1] = $filter('filter')(Teams.savedTeams, { team:1, active:1}, true);
      if ( $scope.activePlayers[1].length > 1) { // Pick a player among active
        $scope.currentPlayer[1] = Teams.drawPlayers($scope.activePlayers[1], 1)[0];
      } else { // Not enough players left : re-activate all players and pick 1
        angular.forEach($scope.gameTeams[1].players, function(player) {
            player.active = 1;
        });
        $scope.activePlayers[1] = $filter('filter')(Teams.savedTeams, { team:1, active:1}, true);
        $scope.currentPlayer[1] = Teams.drawPlayers($scope.activePlayers[1], 1)[0];
      }
    }
  };
});
