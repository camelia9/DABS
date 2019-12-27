angular.module('Dabs')


    .controller('TryCtrl', ['$scope', '$cookies', '$http', '$state', '$mdToast', '$mdDialog', 'config', function TryController($scope, $cookies, $http, $state, $mdToast, $mdDialog, config) {

        $scope.HC.expanded = false;
        var self = this;
        this.isOpen = false;
        var originatorEv;


        this.items = [];


        this.openMenu = function (ev, $mdMenu) {
            originatorEv = ev;
            $mdMenu.open(ev);
        };


        this.orderProduct = function (item) {
            var url = config.backend_url + '/order';
            var req = {
                "itemName": item.name,
                "itemPrice": item.price
            };
            $http.post(url, req, {
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(function (resp) {
                    self.showSimpleToast("Order placed succesfully");
                }, function (err) {
                    self.showSimpleToast("Food data could not be retrieved");
                });

        };

        this.showSimpleToast = function (text) {

            $mdToast.show(
                $mdToast.simple()
                    .textContent(text)
            );
        };


        this.showDialog = function (item) {

            console.log(item);

            var config = {
                parent: angular.element(document.body),
                controller: 'PanelDialogCtrl',
                controllerAs: 'PDC',
                templateUrl: './app/try/menuInfo.html',
                clickOutsideToClose: true,
                autoWrap: false,
                escapeToClose: true,
                focusOnOpen: true,
                locals: {
                    showItem: item
                }
            };

            $mdDialog.show(config)
                .then(function (ok) {
                    console.log(ok);
                }, function (reject) {
                });
        };

        this.getItems = function (product_type) {
            var url = config.backend_url + '/try';
            var req = {
                "type": product_type
            };
            $http.post(url, req, {
                headers: {
                    "content-type": "application/json"
                }
            })
                .then(function (resp) {
                    self.items = resp.data;
                }, function (err) {
                    self.showSimpleToast("Data could not be retrieved");
                });
        };

    }]);
