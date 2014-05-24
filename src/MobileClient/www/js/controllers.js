angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicSideMenuDelegate, AuthService) {

        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        // watch for any changes in the loggedIn status
        $scope.$watch( AuthService.isLoggedIn, function ( isLoggedIn ) {
            $scope.isLoggedIn = isLoggedIn;
            $scope.currentUser = AuthService.currentUser();
        });

    })

    .controller('LoginCtrl', function ($scope, $state) {
        $scope.login = function () {
            $state.go('app.search');
        };

        $scope.signin = function() {
            $state.go('app.search');
        }
    })

    .controller('SignupCtrl', function($scope, $state, Restangular, AuthService) {

        $scope.signup = function (user) {
            Restangular.all('signup').all('local').post({
                id: user.id,
                password: CryptoJS.SHA256(user.password).toString(CryptoJS.enc.Hex),
                email: user.email
            }).then(function (data) {
                console.log(data);
                AuthService.login(data.user.id, data.user.email, data.access_token);
                $state.go('app.search');
            }, function (response) {
                console.log("Error: " + response.toLocaleString());
                $scope.error = response;
            });
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

    });
