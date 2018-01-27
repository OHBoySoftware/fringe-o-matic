angular.module('fringeApp').component('shows', {
    templateUrl: 'app/shows/shows.html',
    controller: [
        '$scope', '$window', '$timeout', '$filter', '$routeParams', 'debounce', 'Data', 'UserData', 'Plurals', 'Schedule',
        function($scope, $window, $timeout, $filter, $routeParams, debounce, Data, UserData, Plurals, Schedule) {
            $scope.moment = moment;
            $scope.plurals = Plurals;
            $scope.allShowPerformances = {};
            $scope.isUserAttendingPerformance = Schedule.isUserAttendingPerformance;
            $scope.isFringeOngoing = Data.isFringeOngoing();

            $scope.userData = {
                preferences: UserData.getPreferences()
            };

            $scope.otherOptions = [
                {value: '*', label: 'All Shows'},
                {value: 'interested', label: 'Interested Only'},
                {value: 'attending', label: 'Attending Only'}
            ];

            $scope.shows = Data.getShows();
            $scope.venues = Data.getVenues();
            $scope.ratings = Data.getRatings();
            $scope.prices = Data.getPrices();
            $scope.sortedShows = Data.getSortedShows();
            $scope.performances = Data.getPerformances();

            $scope.performanceCounts = {};

            angular.forEach($scope.shows, function(show, showId) {
                $scope.performanceCounts[showId] = show.performances.filter(function(performanceId) {
                    return $scope.performances[performanceId].start > Date.now() / 1000;
                }).length;
            });

            $scope.venueOptions = Object.keys($scope.venues).map(function(id) {
                return {value: id, label: $scope.venues[id].name};
            }).sort(function(a, b) {
                return a.label.localeCompareSmart(b.label);
            });
            $scope.venueOptions.unshift({value: '*', label: 'All Venues'});

            $scope.ratingOptions = $scope.ratings.map(function(id, idx) {
                return {value: idx, label: id};
            });
            $scope.ratingOptions.unshift({value: '*', label: 'All Ratings'});

            $scope.resetFilters = function() {
                $scope.selectedVenue = '*';
                $scope.selectedRating = '*';
                $scope.selectedOther = '*';
                $scope.search = '';
            };

            $scope.refresh = function() {
                var showsAttending = Schedule.getShowsAttending(),
                    searchText = $scope.search.toLowerCase().replace(/[^\s\d\w'!?"&-:,\(\)#]/g, '').trim() || '',
                    sanitized = searchText.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
                    searchRegex = new RegExp('(' + sanitized + ')(?![^<]*>|[^<>]*<\\/)', 'i');

                $scope.allShows = $scope.sortedShows.filter(function(showId) {
                    var show = $scope.shows[showId];
                    if ($scope.selectedVenue !== '*' && show.venue !== $scope.selectedVenue) {
                        return false;
                    }
                    if ($scope.selectedRating !== '*' && show.rating !== $scope.selectedRating) {
                        return false;
                    }
                    if ($scope.selectedOther === 'interested' && Schedule.getShowDesire(showId) === 0) {
                        return false;
                    }
                    if ($scope.selectedOther === 'attending' && showsAttending.indexOf(showId) === -1) {
                        return false;
                    }

                    var target = [
                        show.name,
                        show.description,
                        show.artist || '',
                        show.artistLocation || '',
                        $scope.venues[show.venue].name
                    ].join(' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

                    if (searchText && ! searchRegex.exec(target)) {
                        return false;
                    }

                    return true;
                });
            };

            $scope.searchTextEntered = debounce(function() {
                $scope.$apply($scope.refresh)
            }, 50);

            $scope.clearSearch = function() {
                $scope.search = '';
                $scope.refresh();
            };

            $scope.$watch('userData.preferences', $scope.refresh, true);

            $scope.resetFilters();

            if ($routeParams.venue !== undefined) {
                $scope.selectedVenue = Data.findVenueIdBySlug($routeParams.venue) || '*';
            }

            $scope.refresh();
        }
    ]
});