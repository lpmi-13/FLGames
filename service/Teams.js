angular.module('FLGames').factory('Teams',function($http) {

	var Teams = {
    savedTeams : [],
    winner : [],
    looser : [],

    load : function(myFile) {
      var promise = $http.get(myFile).then( function(response) {
          var lines=response.data.split("\n");
          var result = [];
          var headers=lines[0].split(",");
          for (var i=1;i<lines.length;i++){
            var obj = {};
            var currentline=lines[i].split(",");
            for (var j=0;j<headers.length;j++) {
              obj[headers[j].toLowerCase().trim()] = currentline[j];
            }
            obj['absent'] = 0;
            obj['active'] = 1;
            obj['team'] = '';
            result.push(obj);
          }

          //return result; //JavaScript object
          return JSON.stringify(result); //JSON
      });

      return promise;
    },

		selected : function(teamName, myClasses) {
			var teamList = [];
			if (teamName != 'no-class') {
        angular.forEach(myClasses, function (pupil) {
          if (pupil.class === teamName) {
						teamList.push(pupil);
					}
				})
			}
			return teamList;
		},

    draw: function(nb, pupilsList) {
      var team;
      if (pupilsList) {
        // Shuffle class
        pupilsList = this.shuffle(pupilsList);
        // Draw nb teams
        team = 0;
        angular.forEach(pupilsList, function (pupil) {
          if (pupil.absent === 0) {
            pupil.team = team;
            pupil.active = 1;
            team += 1;
            if ( team === nb ) { // # of teams limit
              team = 0; // Start over
            }
          } else {
            // Absent pupil : no team and inactive
            pupil.team = '';
            pupil.active = 0;
          }
        });
        
        // Save teams to share with different views
        this.savedTeams = pupilsList;

        return pupilsList;
      } else {
        team = 0;
        pupilsList = [];
        for (var i=0; i<nb; i++) {
          pupilsList.push({ 'name': false, 'class': false, 'team': i, 'active':1});
        }

        // Save teams to share with different views
        this.savedTeams = pupilsList;

        return pupilsList;
      }
    },
    
      /* TODO : Remove jslint error
    shuffle: function(o) {
      for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
      return o;  
      */
    shuffle: function(array) {
      var counter = array.length, temp, index;

      // While there are elements in the array
      while (counter > 0) {
          // Pick a random index
          index = Math.floor(Math.random() * counter);

          // Decrease counter by 1
          counter--;

          // And swap the last element with it
          temp = array[counter];
          array[counter] = array[index];
          array[index] = temp;
      }

      return array;
    },

    drawPlayer: function(pupilsList, active) {
      var rand = Math.floor(Math.random() * pupilsList.length);
      pupilsList[rand].active = 0;
      return pupilsList[rand];
    }
  };

	return Teams;
});
