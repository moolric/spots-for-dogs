/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('SpotController', SpotController);

    function SpotController($scope, $stateParams, $state, $sce, Logger, Spotlight, uiGmapGoogleMapApi, uiGmapIsReady, Snazzy) {
        Logger.loaded('SpotController');
        $scope.spotID = $stateParams.spotID;

        Spotlight.getSpot($scope.spotID)
            .then(function(data) {
                $scope.spot = data;
                if ($scope.spot.tags.length === 0){
                    $scope.spot.tags = "";
                }
                if ($scope.spot.content.length === 0){
                    $scope.spot.content = "";
                }
                if ($scope.spot.images.length !== 0) {
                    _setImageTypes();
                }
                $scope.spot.photosphere = $sce.trustAsResourceUrl("https://www.google.com/maps/embed/v1/streetview?key=AIzaSyDm-Vbz2gfu0PGOsBr3_ItNz3ALKXjZX4M&location=46.414382,10.013988&pitch=10&fov=90");
                $scope.spot.photosphere = $sce.trustAsHtml('<iframe width="100%" height="500" frameborder="0" style="border:0" src="' + $scope.spot.photosphere + '" allowfullscreen></iframe>');
                Logger.shout($scope.spot.photosphere);
                _includeMap();

            }, function(reason) {
                Logger.error(reason);
            }, function(message) {
                Logger.info(message);
            });

        function _includeMap() {
            uiGmapGoogleMapApi.then(function() {
                var theme =  Snazzy.getSnazzy('paper');
                $scope.map = {
                    center: {
                        latitude: $scope.spot.lat,
                        longitude: $scope.spot.lng
                    },
                    zoom: 16,
                    options: {
                        styles: theme
                    },
                    marker : {
                        id: 1,
                        coords: {
                            latitude: $scope.spot.lat,
                            longitude: $scope.spot.lng
                        },
                        title:$scope.spot.name
                    }
                }
            });
        }

        function _setImageTypes() {
            $scope.spot.photos = [];
            $scope.spot.photospheres = [];
            angular.forEach($scope.spot.images, function(image, key) {
                if (image.image_type_id === 1) {
                    $scope.spot.photos.push(image);
                } else if (image.image_type_id === 2){
                    $scope.spot.photospheres.push(image);
                }
            });
            Logger.shout($scope.spot);
        }


    }
})();
