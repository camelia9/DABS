angular.module('Dabs')
    .controller('RecommendCtrl', ['$scope', '$cookies', '$http', 'config', '$mdToast', function RecommendController($scope, $cookies, $http, config, $mdToast) {
        $scope.HC.expanded = false;
        var self = this;
        this.hasOrder = false;
        this.orderValue = 0;
        this.items = [];

        this.showSimpleToast = function (text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
            );
        };

        this.getOrder = function () {
            var url = config.backend_url + '/getOrder';
            $http.get(url)
                .then(function (resp) {
                    if(resp && resp.data && resp.data.length > 0){
                        self.items = resp.data;
                        self.computeOrder();
                        self.hasOrder = true;
                    }
                }, function (err) {
                    self.showSimpleToast("Order data could not be retrieved");
                });
        };

        this.computeOrder = function () {
            self.orderValue = 0;
            self.items.forEach(function (item) {
                self.orderValue += parseInt(item.price);
            });


        };


        this.chooseMethod = function (method) {
            this.paymentMethod = method;
        };


        this.pay = function () {
            var url = config.backend_url + '/pay';
            $http.get(url)
                .then(function (resp) {
                    self.showSimpleToast("Payment placed successfully.");
                    window.location.reload('/');
                }, function (err) {
                    self.showSimpleToast("Payment failed. Please try again later.");
                });


            var url2 = config.backend_url + '/addMoneySpent';
            var req = {'payed':self.orderValue};
            $http.post(url2, req, {
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(function (resp) {
                    console.log('Add recommend succesfully');
                }, function (err) {
                    console.error('Error');
                });
        };

    }]);
