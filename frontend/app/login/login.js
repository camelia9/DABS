angular.module('Dabs')
    .controller('LoginCtrl', ['$rootScope', '$state', '$stateParams', '$http', 'config', '$cookies', '$sha', function LoginController($rootScope, $state, $stateParams, $http, config, $cookies, $sha) {
        var self = this;
        this.user = "";
        this.pass = "";

        $sha.setConfig({
            algorithm: 'SHA-256', // hashing algorithm to use
            inputType: 'TEXT', // Input type
            returnType: 'HEX', // Return type
            secretType: 'TEXT' // Secret for HMAC
        });
        this.authStat = true;
        this.goHome = function () {

            if (self.user && self.pass) {
                var hashPass = $sha.hash(self.pass);
                var url = config.backend_url + '/authentication';
                var req = {
                    "email": self.user,
                    "password": hashPass,
                    "auth_type": "own"
                };
                $http.post(url, req, {
                    headers: {
                        "content-type": "application/json"
                    }
                })
                    .then(function (resp) {
                        $cookies.put('user_token', resp.user_token);
                        $state.go('home', {
                            user_token: self.user_token
                        });
                    }, function (err) {
                        console.log(err);
                        self.authMessage = err.data.message;
                        self.authStat = false;
                    });

            }
            else{
                self.authMessage = "Please fill in the credentials!";
                self.authStat = false;
            }
        }
    }]);
