angular.module('grammarGamble').controller('GameboardCtrl',function($scope, $state, $filter, Teams, Data, $sce, $timeout, DialogService, gettext, gettextCatalog){

  $scope.question = $sce.trustAsHtml('');
  $scope.showAnswer = false;
	$scope.saved = [];
  $scope.selectedTopic = false;
	$scope.playersList = Teams.playersList;
  $scope.audio_winner = document.getElementById('audio_winner');

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
  Data.get('grammarGamble/data/myData.txt').then( function(result) { 
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
        $state.go('winner', {gameId: 'grammarGamble'});
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };


  $scope.drawQuestion = function() {
    // Init question
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
		// Parse selected question for timer and answer
		questionParts = randQuestion.split('::');
		// if (questionParts[1]) {
		// 	$scope.questionAnswer = $sce.trustAsHtml(questionParts[1]);
		// } else {
		// 	$scope.questionAnswer = '---';
		// }
		if (questionParts[2]) { // Correction, so Wrong
			// if (questionParts[1].match(/Right/)) {
			$scope.questionToSave = $sce.trustAsHtml(questionParts[1]+' → '+questionParts[2]);
			$scope.questionAnswer = $scope.questionToSave;
		} else {
			$scope.questionAnswer = $sce.trustAsHtml(questionParts[1]);
			// $scope.questionToSave = $scope.questionAnswer+' → '+$sce.trustAsHtml(questionParts[2]);
			$scope.questionToSave = $sce.trustAsHtml($scope.questionAnswer+' → '+questionParts[0]);
		}
		$scope.question = $sce.trustAsHtml(questionParts[0]); // Trigger question display
  };
  
	$scope.saveAnswer = function() {
		$scope.saved.push($scope.questionToSave);
		$scope.close();
	};

	$scope.deleteSaved = function(index) {
		$scope.saved.splice(index, 1);
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
  

  $scope.myAlert = function() {
    var dialogOptions = {
      headerText: gettext('Are you sure?'),
      bodyText: gettext('Do you really want to quit the game and go back to configuration page?'),
      callback: function () {
				$state.go('grammarGamble');
      }
    };
    DialogService.showModalDialog({}, dialogOptions);
  };

});
