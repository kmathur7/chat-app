console.log("SW startup");

self.addEventListener('install', function(event) {
  console.log("SW installed");

  event.waitUntil(
    caches.open('V1').then(function (cache) {
      return cache.addAll([
        '/images/chat.png',
        '/lib/angular.min.js',
        '/lib/angular-animate.min.js',
        '/lib/angular-aria.min.js',
        '/lib/angular-material.min.js',
        '/scripts/app.js',
        '/lib/socket.io.js'
        ]);
      // body...
    })
    )


});

self.addEventListener('activate', function(event) {
  console.log("SW activated");
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});



self.addEventListener('push', function(event) {  
  // Since there is no payload data with the first version  
  // of push messages, we'll grab some data from  
  // an API and use it to populate a notification 
  
self.registration.pushManager.getSubscription().then(function(subscription){
      console.log(subscription);
    })

  event.waitUntil(  
    self.registration.pushManager.getSubscription().then(function(subscription){



    fetch('/pushData',{
      method:'post',
      headers:{
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body:JSON.stringify(subscription)
    }).then(function(response) { 

      if (response.status !== 200) {  
        // Either show a message to the user explaining the error  
        // or enter a generic message and handle the
        // onnotificationclick event to direct the user to a web page  
        console.log('Looks like there was a problem. Status Code: ' + response.status);  
        throw new Error();  
      }
      
      // Examine the text in the response  
      return response.json().then(function(data) {  
        if (data.error || !data.notification) {  
          console.error('The API returned an error.', data.error);  
          throw new Error();  
        }  

        var title = data.notification.title;  
        var message = data.notification.message;  
        var icon = '/images/chat.png';  
        var notificationTag = data.notification.tag;

        return self.registration.showNotification(title, {  
          body: message,  
          icon: icon,  
          tag: notificationTag  
        });  
      });  
    }).catch(function(err) {  
      console.error('Unable to retrieve data', err);

  
      return;  
    })
    })  
  );  
});

