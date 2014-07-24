angular.module('FLGames').factory('readClasses',function($http) {

	var readClasses = { 
    get : function(myFile) {
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
            obj['team'] = 0;
            result.push(obj);
          }

          //return result; //JavaScript object
          return JSON.stringify(result); //JSON
      });

      return promise;
    }
  };

	return readClasses;
});
