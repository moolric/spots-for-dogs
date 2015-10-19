/* global angular */

(function () {
    'use strict';

    angular
        .module('spots')
        .controller('SpotsController', SpotsController);

    function SpotsController($scope, $state, $q, Logger, uiGmapGoogleMapApi, uiGmapIsReady, Spotlight, Snazzy) {
        Logger.loaded('SpotsController');

        $scope.spots = [];
        $scope.filter = [];
        $scope.filter['owner'] = "";
        $scope.filter['tag'] = "";
        $scope.mapVisibility = "nope";



        $q.all([
            Spotlight.getAll('owners'),
            Spotlight.getAll('categories'),
            Spotlight.getAll('tags'),
            Spotlight.getAll('spots')
        ]).then(function(data) {
            $scope.owners = data[0];
            $scope.categories = data[1];
            $scope.tags = data[2];
            $scope.spots = data[3];
            _setFeatureImages();
            _loadMap();

        }, function(reason) {
            Logger.error(reason);
        }, function(message) {
            Logger.info(message);
        });

        $scope.putCoords = function(spot) {
            Spotlight.putSpot(spot);
        };


        function _loadMap() {
            uiGmapGoogleMapApi.then(function() {
                var theme =  Snazzy.getSnazzy('paper');
                $scope.map = {
                    center: {
                        latitude: -27.465650,
                        longitude: 153.024593
                    },
                    zoom: 18,
                    options: {
                        styles: theme
                    },
                    bounds:{},
                    markers:[]
                }

                uiGmapIsReady.promise().then(function() {
                    angular.forEach($scope.spots, function(spot, key) {
                        if (spot.lat || spot.lng) {
                            spot.coords = "done";
                            $scope.map.markers.push({
                                id: key,
                                latitude: spot.lat,
                                longitude: spot.lng,
                                options: {title: spot.name}

                            });
                        }
                    });

                    $scope.mapVisibility = "yep";

                });
            });
        }

        function _setFeatureImages() {
            angular.forEach($scope.spots, function(spot, key) {
               if (spot.has_pictures === 1) {
                   spot.feature = spot.images[0];
                   Logger.log(spot.feature);
               }
            });
        }






    }
})();
