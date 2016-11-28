angular.module("FLGames").directive('flDraggable', function() {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var options = scope.$eval(attrs.flDraggable); //allow options to be passed in
      elm.draggable(options);
    }
  };
});
