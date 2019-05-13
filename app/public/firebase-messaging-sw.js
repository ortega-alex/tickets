importScripts('https://www.gstatic.com/firebasejs/5.9.1/firebase-app.js');
importScripts("https://www.gstatic.com/firebasejs/5.9.1/firebase-messaging.js");

firebase.initializeApp({
    messagingSenderId: 'your messagingSenderId' // troque pelo seu sender id 
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    var notificationTitle = payload.data.title ;
    var notificationOptions = {
      body: payload.data.body,
      icon: payload.data.icon
    };
  
    return self.registration.showNotification(notificationTitle,
      notificationOptions);
  });