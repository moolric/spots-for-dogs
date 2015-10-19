/* global angular */

(function() {
    'use strict';

    angular.module('spots')
        .directive('noWidow', function() {
            return {
                restrict: 'A',
                replace: true,
                link: function($scope, elem, attr) {
                    var txt = elem.html(),
                        tag = elem[0].nodeName.toLowerCase(),
                        wordArray = txt.split(" ");

                    if (wordArray.length > 1) {
                        wordArray[wordArray.length - 2] += "&nbsp;" + wordArray[wordArray.length - 1];
                        wordArray.pop();
                    }

                    elem.html('<' + tag + '>' + wordArray.join(" ") + '</' + tag + '>');
                }
            };
        });
})();
