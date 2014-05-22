angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicSideMenuDelegate) {
        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        }
    })

    .controller('LoginCtrl', function ($scope, $state) {
        $scope.login = function () {
            $state.go('app.search');
        }

        $scope.signin = function() {
            $state.go('app.search');
        }
    })

    .controller('SignupCtrl', function($scope, $state) {
        $scope.signup = function() {
            $state.go('app.search');
        }
    })

    .controller('PlaylistsCtrl', function ($scope) {
        $scope.playlists = [
            { title: 'Reggae', id: 1 },
            { title: 'Chill', id: 2 },
            { title: 'Dubstep', id: 3 },
            { title: 'Indie', id: 4 },
            { title: 'Rap', id: 5 },
            { title: 'Cowbell', id: 6 }
        ];
    })

    .controller('PlaylistCtrl', function ($scope, $stateParams) {
        //$scope.header_title = "Playlist";
    });
