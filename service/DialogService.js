angular.module('FLGames').factory('DialogService',function(gettext, $modal) {

	var DialogService = {

    dialogDefaults : {
      backdrop: true,
      keyboard: true,
      backdropClick: true,
      dialogFade: true,
      templateUrl: 'partial/dialog/dialog.html'
    },

    dialogOptions : {
      closeButtonText: gettext('No'),
      actionButtonText: gettext('Yes'),
      headerText: gettext('Proceed?'),
      bodyText: gettext('Perform this action?')
    },
  
    showDialog : function (customDialogDefaults, customDialogOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempDialogDefaults = {};
        var tempDialogOptions = {};

        //Map angular-ui dialog custom defaults to dialog defaults defined in this service
        angular.extend(tempDialogDefaults, this.dialogDefaults, customDialogDefaults);

        //Map dialog.html $scope custom properties to defaults defined in this service
        angular.extend(tempDialogOptions, this.dialogOptions, customDialogOptions);

        var d = $modal.open(tempDialogDefaults);

        if (!tempDialogDefaults.controller) {
            tempDialogDefaults.controller = function ($scope, $modal) {
                $scope.dialogOptions = tempDialogOptions;
                $scope.dialogOptions.close = function (result) {
                    d.close(result);
                };
                $scope.dialogOptions.callback = function () {
                    d.close();
                    if (customDialogOptions && customDialogOptions.callback) {
                      customDialogOptions.callback();
                    }
                };
            };
        }

    },

    showModalDialog : function (customDialogDefaults, customDialogOptions) {
        if (!customDialogDefaults) { customDialogDefaults = {}; }
        customDialogDefaults.backdropClick = false;
        this.showDialog(customDialogDefaults, customDialogOptions);
    }

  };

	return DialogService;
});
