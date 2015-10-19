/* global angular */

(function () {
    'use strict';

    angular.module('spots')
        .directive('streetView', function () {

            return {
                restrict: 'EA',
                template: '<iframe class="frame" height="400" width="100%" frameborder="0" border="0" marginwidth="0" marginheight="0" src="{{spot.photosphere}}"></iframe>'
            };
        });

})();