angular.module('tictactoe').controller('tictactoeGameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, $timeout, DialogService, gettext, gettextCatalog){
  
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
  Data.get('tictactoe/data/myData.txt').then( function(result) { 
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
		// console.log($scope.allTopics.length);
  });

  // Prepare board game
  $scope.board = [
    [$sce.trustAsHtml(''), $sce.trustAsHtml(''), $sce.trustAsHtml('')],
    [$sce.trustAsHtml(''), $sce.trustAsHtml(''), $sce.trustAsHtml('')],
    [$sce.trustAsHtml(''), $sce.trustAsHtml(''), $sce.trustAsHtml('')],
  ];

  $scope.currentPlayer = false;
  $scope.selectedTopic = false;
  $scope.newGame = true;
  $scope.currentPlayer = false;
  $scope.nextTeam = 0;
  $scope.winner = false;
  $scope.started = false;
  $scope.gameTeams = [];
  $scope.logoList = ['img/tick.png', 'img/cross.png'];
  for (var i=0; i<2; i++) {
    if (Teams.savedTeams.length > 0 ) {
      $scope.gameTeams.push({'logo': $scope.logoList[i], 'name': 'Team '+i, 'score':0, 'winner':false, 'players': $filter('filter')(Teams.savedTeams, {'team':i})});
    } else {
      $scope.gameTeams.push({'logo': $scope.logoList[i], 'name': 'Team '+i, 'score':0, 'winner':false, 'players': [{'team':i, name:''}]});
    }
  }

  $scope.gameStart = function() {
    if ($scope.selectedTopic !== false) {
      $scope.started = true;
      // Select a player
      $scope.selectPlayer();
    } else {
      var dialogOptions = {
        closeButtonText: 'Ok',
        actionButtonText: '',
        headerText: gettext('No topic!'),
        bodyText: gettext('You need to select a topic before starting the game.')
      };
      DialogService.showModalDialog({}, dialogOptions);
    }
  };
  
  $scope.selectTopic = function(topic) {
    // Filter selected questions
    $scope.selectedTopic = $filter('filter')($scope.questions, {'topic': topic});
    //console.log($scope.selectedTopic);
    var length = $scope.selectedTopic.length;
    if (length < 9) { // Not 9 items in the list
      var dialogOptions = {
        closeButtonText: 'Ok',
        actionButtonText: '',
        headerText: gettext('Short list!'),
        bodyText: gettext('There isn\'t enough items in your list. You should check the data file and restart the game or choose another topic.')
      };
      DialogService.showModalDialog({}, dialogOptions);

      return false;
    } else { // Pick 9 unique random items
      var arr = [];
      while(arr.length < 9){
        var randomnumber = Math.floor(Math.random()*length);
        var found = false;
        for(var i=0;i<arr.length;i++){
          if ( arr[i] === randomnumber ) { found = true; break; }
        }
        if ( !found ) { arr[arr.length] = randomnumber; }
      }
      // Fill the board
      $scope.board = [
        [$sce.trustAsHtml($scope.selectedTopic[arr[0]].question), $sce.trustAsHtml($scope.selectedTopic[arr[1]].question), $sce.trustAsHtml($scope.selectedTopic[arr[2]].question)],
        [$sce.trustAsHtml($scope.selectedTopic[arr[3]].question), $sce.trustAsHtml($scope.selectedTopic[arr[4]].question), $sce.trustAsHtml($scope.selectedTopic[arr[5]].question)],
        [$sce.trustAsHtml($scope.selectedTopic[arr[6]].question), $sce.trustAsHtml($scope.selectedTopic[arr[7]].question), $sce.trustAsHtml($scope.selectedTopic[arr[8]].question)],
      ];
    }
  };

  $scope.selectPlayer = function() {
    // Not a new game any longer
    $scope.newGame = false;
    if ( Teams.savedTeams.length === 0) { // No class selected
      // Generic player, no name
      $scope.currentPlayer = $scope.gameTeams[$scope.nextTeam].players[0];
      // Set logo
      $scope.currentPlayer.logo = $scope.gameTeams[$scope.nextTeam].logo;
    } else { // A class is selected
      // Draw a random player
      $scope.activePlayers = $filter('filter')(Teams.savedTeams, {team:$scope.nextTeam, active:1});
      //console.log($scope.activePlayers.length);
      $scope.currentPlayer = Teams.drawPlayer($scope.activePlayers, 1);
      // Set logo
      $scope.currentPlayer.logo = $scope.gameTeams[$scope.currentPlayer.team].logo;
      // Check remaining active players
      if ($scope.activePlayers.length === 1) { // Restart list
        angular.forEach($scope.gameTeams[$scope.currentPlayer.team].players, function(player) {
          if (player.team === $scope.currentPlayer.team) {
            player.active = 1;
          }
        });
      }
      // Display selected player
      $scope.zoom = true;
      $timeout( function() { $scope.zoom = false;}, 1000 );
    }
  };

  $scope.switchTeams = function() {
    if ( $scope.nextTeam === 0) {
      $scope.nextTeam = 1;
    } else {
      $scope.nextTeam = 0;
    }
  };

  $scope.dropPiece = function(event, row, col) {
    if (!$scope.newGame) { // Game is on its way...
      // Disable click event (CSS transparent div) to prevent double click
      document.getElementById('backdrop').setAttribute("style", "display: block;"); 
      $timeout( function() { document.getElementById('backdrop').setAttribute("style", "display: none;"); }, 1500);

      // Move logo on board
      if ( toBoard(event) ) {
        // Wait for animation before replacing the cell content
        $timeout( function() { $scope.board[row][col] = $sce.trustAsHtml('<img class="team-'+$scope.currentPlayer.team+'" src="'+$scope.gameTeams[$scope.currentPlayer.team].logo+'" />'); }, 500 ).then( function() { 
          // Test if winner
          grade();
          if ( $scope.winner !== '') {
            $scope.gameTeams[$scope.currentPlayer.team].winner = true;
            // Adjust scores
            $scope.gameTeams[$scope.currentPlayer.team].score += 1;
            $scope.winner = $scope.currentPlayer;
            // Throw applause
            var audioplayer_winner = document.getElementById('audio_winner');
            audioplayer_winner.play();
            $scope.blink = $scope.winner.team;
            $timeout( function() {
              $scope.blink = -1;
              $scope.mixTopic();
              $scope.switchTeams();
              // Jump to winner page is 5 points for a team
              if ($scope.gameTeams[$scope.currentPlayer.team].score === 5) {
                $scope.finalScore();
                $state.go('winner', {gameId: 'tictactoe'});
              } else {
                $scope.selectPlayer();
              }
            }, 3000 );
          } else { // No winner, keep going...
            $scope.switchTeams();
            $scope.selectPlayer();
          }
        });
      }
    } else { // Game not started
      $scope.gameStart();
    }
  };

  function toBoard(e) {
    var el = document.getElementById('logoTeam'+$scope.currentPlayer.team);
    // Get mouse position
    var left =  e.clientX-100;
    var top =  e.clientY-50;
    el.setAttribute("style","left: " + left + "px; top: " + top + "px;");

    // Logo position back to normal
    // Timeout based upon CSS animation time
    $timeout( function() { 
      el.setAttribute("style","display: none;"); 
      }, 500)
    .then( function() { 
      $timeout( function() { 
        el.setAttribute("style",""); 
        }, 700
      );
    });
    return true;
  }
  
  /*
  $scope.$watch('gameTeams[0].score', function() {
    console.log('ok0');
  });
  $scope.$watch('gameTeams[1].score', function() {
    console.log('ok1');
  });
  */

  function grade() { // Test if winner
    var b = $scope.board;
    function row(r) { return same($sce.getTrustedHtml(b[r][0]), $sce.getTrustedHtml(b[r][1]), $sce.getTrustedHtml(b[r][2]));}
    function col(c) { return same($sce.getTrustedHtml(b[0][c]), $sce.getTrustedHtml(b[1][c]), $sce.getTrustedHtml(b[2][c]));}
    function diagonal(i) { return same($sce.getTrustedHtml(b[0][1-i]), $sce.getTrustedHtml(b[1][1]), $sce.getTrustedHtml(b[2][1+i]));}
    function same(a, b, c) { return (a===b && b===c) ? a : '';}
    $scope.winner =
      row(0) || row(1) || row(2) ||
      col(0) || col(1) || col(2) ||
      diagonal(-1) || diagonal(1);
  }

  $scope.mixTopic = function() {
    var dialogOptions = {
        headerText: gettext('Mix topic?'),
        bodyText: gettext('This will clear the board from all logos! Are you sure?'),
        callback: function () {
          $scope.selectTopic($scope.selectedTopic[0].topic);
        }
    };
    if ( $scope.winner !== '') { // A game has just been won, just mix topic
      $scope.selectTopic($scope.selectedTopic[0].topic);
    } else { // Throw alert message before mixing topic
      DialogService.showModalDialog({}, dialogOptions);
    }
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

  $scope.endGame = function() {
    var dialogOptions = {
      headerText: gettext('End game?'),
      bodyText: gettext('Are you sure you want to end the game?'),
      callback: function () {
        $scope.finalScore();
        $state.go('winner', {gameId: 'tictactoe'});
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
          $state.go('tictactoe', {classId : $scope.gameTeams[0].players[0].class });
        } else {
          $state.go('tictactoe');
        }
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

});
