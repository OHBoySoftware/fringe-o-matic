angular.module('fringeApp').controller('slotPerformancesModalCtrl', [
    '$uibModalInstance', '$scope', 'Data', 'Schedule', 'Sorters', 'slotStart', 'slotStop', 'slotPerformances',
    function($uibModalInstance, $scope, Data, Schedule, Sorters, slotStart, slotStop, slotPerformances) {
        $scope.slotStart = slotStart;
        $scope.slotStop = slotStop;

        Data.getShows().then(function(shows) {
            $scope.shows = shows;
        });
        Data.getPerformances().then(function(performances) {
            $scope.performances = performances;

            $scope.slotPerformances = slotPerformances.sort(function(a, b) {
                return Sorters.performance(performances[a], performances[b]);
            });
        });
        Data.getVenues().then(function(venues) {
            $scope.venues = venues;
        });

        $scope.ok = function() {
            $uibModalInstance.close();
        };

        $scope.remove = function(performanceId) {
            Schedule.remove(performanceId);
            $scope.slotPerformances.remove(performanceId);

            if ($scope.slotPerformances.length === 0) {
                $scope.ok();
            }
        };
    }
]);