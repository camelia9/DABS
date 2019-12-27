angular.module('Dabs')
    .controller('LoginCtrl', ['$rootScope', '$state', '$stateParams', '$http', 'config', '$cookies', function LoginController($rootScope, $state, $stateParams, $http, config, $cookies) {
        var self = this;
        this.user = "";
        $cookies.put('review', false);
        this.authStat = true;
        this.goHome = function () {
            if (self.user) {
                var url = config.backend_url + '/login';
                var req = {
                    "user": self.user
                };
                $http.post(url, req, {
                    headers: {
                        "content-type": "application/json"
                    }
                })
                    .then(function (resp) {
                        $cookies.put('user', self.user);
                        $state.go('home', {
                            user: self.user
                        });
                    }, function (err) {
                        console.log(err);
                        self.authMessage = err.data.message;
                        self.authStat = false;
                    });

            }
            else{
                self.authMessage = "Please fill in an username!";
                self.authStat = false;
            }
        }
    }]);
