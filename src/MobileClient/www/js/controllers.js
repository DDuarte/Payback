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

    .controller('FriendsCtrl', function ($scope) {
        $scope.data = {
            showDelete: false
        };

        $scope.onFriendDelete = function(idx) {
            $scope.friends.splice(idx, 1);
        };

        $scope.friends = [
            { id: 'Reggae',  avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y' },
            { id: 'Chill',   avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon&f=y' },
            { id: 'Dubstep', avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=monsterid&f=y' },
            { id: 'Indie',   avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=wavatar&f=y' },
            { id: 'Rap',     avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro&f=y' },
            { id: 'Cowbell', avatar_url: 'http://www.gravatar.com/avatar/00000000000000000000000000000000?d=blank&f=y' }
        ];
    })

    .controller('FriendCtrl', function ($scope, $stateParams) {

    });
