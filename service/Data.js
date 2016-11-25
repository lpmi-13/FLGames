angular.module('FLGames').factory('Data',function($http) {

	var Data = {
    get : function(myFile) {
      var promise = $http.get(myFile).then( function(response) {
          var lines=response.data.split("\n");
          var result = [];
          var currentline;
          var topic;
          for (var i=0;i<lines.length;i++){
            var obj = {};
            if ( lines[i].charAt(0) === ':' ) {
              // Get rid of starting colon and any immediately following white spaces
              currentline = lines[i].replace(/^(:+\s*)+/g,'');
              // Save topic title
              topic = currentline;
            } else {
              obj['topic'] = topic;
              // Save questions content
              currentline = lines[i];
              if (currentline !== '') {
                // Add images links for [...] markers
                currentline = currentline.replace(/\[(.*)\]/g, "<img class='img-rounded' src=data/img/$1 alt=? />");
                obj['question'] = currentline;
                result.push(obj);
              }
            }
          }

          //return result; //JavaScript object
          return JSON.stringify(result); //JSON
      });

      return promise;
    }
  };

	return Data;
});
