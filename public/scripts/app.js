function emojify(){
  twemoji.parse(document.body);
  return;
}


angular.module('chatApp',['ngMaterial','ngSanitize','sc.twemoji'])
  .config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('brown')
    .accentPalette('orange');
  })
  

	.controller('ChatController',function ($scope,$window,twemoji) {
    var messagePayload = {
        "id":"",
        "regid":"",
        'message':"",
        "username":""
      };
    $scope.isPushEnabled = false;
    $scope.isDisabled = false;

    if ('serviceWorker' in $window.navigator) {  
      $window.navigator.serviceWorker.register('/sw.js')  
      .then(initialiseState);  
    } 
    else {  
    console.warn('Service workers aren\'t supported in this browser.');  
    }


    function initialiseState() {  
      // Are Notifications supported in the service worker?  
      if (!('showNotification' in $window.ServiceWorkerRegistration.prototype)) {  
        console.warn('Notifications aren\'t supported.');  
        return;  
      }

      // Check the current Notification permission.  
      // If its denied, it's a permanent block until the  
      // user changes the permission  
      if ($window.Notification.permission === 'denied') {  
        console.warn('The user has blocked notifications.');  
        return;  
      }

      // Check if push messaging is supported  
      if (!('PushManager' in $window)) {  
        console.warn('Push messaging isn\'t supported.');  
        return;  
      }

      // We need the service worker registration to check for a subscription  
      $window.navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
        // Do we already have a push message subscription?  
        serviceWorkerRegistration.pushManager.getSubscription()  
          .then(function(subscription) {  
            // Enable any UI which subscribes / unsubscribes from  
            // push messages.  
            $scope.isDisabled = false;

            if (!subscription) {  
            // We aren't subscribed to push, so set UI  
            // to allow the user to enable push  
            return;  
            }

            // Keep your server in sync with the latest subscriptionId
            sendSubscriptionToServer(subscription);

            // Set your UI to show they have subscribed for  
            // push messages  
            //pushButton.textContent = 'Disable Push Messages';  
            $scope.isPushEnabled = true;  
          })  
          .catch(function(err) {  
            console.warn('Error during getSubscription()', err);  
          });  
      });  
    }




    function subscribe() {  
      // Disable the button so it can't be changed while  
      // we process the permission request  
      $scope.isDisabled = true;

      $window.navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
        serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly:true})  
        .then(function(subscription) {  
          // The subscription was successful  
          $scope.isPushEnabled = true;  
          $scope.isDisabled = false;
          // TODO: Send the subscription.endpoint to your server  
          // and save it to send a push message at a later date
          return sendSubscriptionToServer(subscription);  
        })  
        .catch(function(e) {  
          if ($window.Notification.permission === 'denied') {  
            // The user denied the notification permission which  
            // means we failed to subscribe and the user will need  
            // to manually change the notification permission to  
            // subscribe to push messages  
            console.warn('Permission for Notifications was denied');
            $scope.isDisabled = true;  
              
          } 
          else {  
            // A problem occurred with the subscription; common reasons  
            // include network errors, and lacking gcm_sender_id and/or  
            // gcm_user_visible_only in the manifest.  
            console.error('Unable to subscribe to push.', e);
            $scope.isDisabled = false;  
              
            //pushButton.textContent = 'Enable Push Messages';  
          }  
        });  
      });  
    }





    function unsubscribe() {  
      $scope.isDisabled = true;

      $window.navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {  
        // To unsubscribe from push messaging, you need get the  
        // subscription object, which you can call unsubscribe() on.  
        serviceWorkerRegistration.pushManager.getSubscription().then(  
        function(pushSubscription) {  
          // Check we have a subscription to unsubscribe  
          if (!pushSubscription) {  
            // No subscription object, so set the state  
            // to allow the user to subscribe to push  
            $scope.isPushEnabled = false;
            $scope.isDisabled = false;  
            
            //pushButton.textContent = 'Enable Push Messages';  
            return;  
          }  
          var subscriptionId = pushSubscription.subscriptionId;  
          // TODO: Make a request to your server to remove  
          // the subscriptionId from your data store so you
          // don't attempt to send them push messages anymore

          // We have a subscription, so call unsubscribe on it  
          pushSubscription.unsubscribe().then(function(successful) {
            $scope.isDisabled = false;  
            //pushButton.textContent = 'Enable Push Messages';  
            $scope.isPushEnabled = false;  
          }).catch(function(e) {  
            // We failed to unsubscribe, this can lead to  
            // an unusual state, so may be best to remove
            // the users data from your data store and
            // inform the user that you have done so
            console.log('Unsubscription error: ', e); 
            $scope.isDisabled = false;  
            
            //pushButton.textContent = 'Enable Push Messages';
           });  
        }).catch(function(e) {  
          console.error('Error thrown while unsubscribing from push messaging.', e);  
        });  
      });  
    }


    function sendSubscriptionToServer(data){
      //var temp = data.endpoint.toString().slice(40);
      socket.emit('new', data);
      messagePayload.regid = data.endpoint.toString().slice(40);
    }










    $scope.changePushState = function(){
      if ($scope.isPushEnabled) {  
      unsubscribe();  
      } 
      else {  
      subscribe();  
      } 
    };


    































    
    $scope.logi = false;
		$scope.messages = [];
    $scope.chatmessage="";
		$scope.sendMessage = function(){
      
      messagePayload.message = $scope.chatmessage;
      
      socket.emit('chat message', messagePayload);
      $scope.chatmessage = "";
    };

    $scope.login = function (argument) {
      messagePayload.username = $scope.username;
      $scope.logi = true;
    }

    $scope.isOpen = false;
      $scope.demo = {
        isOpen: false,
        count: 0,
        selectedDirection: 'right'
      };

    $scope.emojify = function () {
      emojify()

    };

    $scope.addEmoji = function (id) {
      var emojilist = ['&#x1f600;','&#x1f601;','&#x1f61b;','&#x1f61d;','&#x1f602','&#x1f609','&#x1f60e','&#x1f610','&#x1f616','&#x1f620','&#x1f62d','&#x1f634','&#x1f631','&#x1f44c;','&#x1f44f;'];
      $scope.chatmessage = $scope.chatmessage + " "+ emojilist[id] + " ";
    }

    var socket = io();

    socket.on('id', function (msg) {
      messagePayload.id = msg;
      
    });

    socket.on('newmsg', function(msg){
      
      $scope.messages.push(msg);
      $scope.$apply();
      emojify()

    });

	});