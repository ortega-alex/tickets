importScripts('https://www.gstatic.com/firebasejs/6.0.2/firebase-app.js');
importScripts("https://www.gstatic.com/firebasejs/6.0.2/firebase-messaging.js");

firebase.initializeApp({
  //messagingSenderId: 'your messagingSenderId' // troque pelo seu sender id 
  apiKey: "AIzaSyCJrR_gJVx3D0OXYPfuiMNmdSDg_Mww-_U",
  authDomain: "tickets-45d8c.firebaseapp.com",
  databaseURL: "https://tickets-45d8c.firebaseio.com",
  projectId: "tickets-45d8c",
  storageBucket: "tickets-45d8c.appspot.com",
  messagingSenderId: "648627977033",
  appId: "1:648627977033:web:b16683bfd984600d"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  var notificationTitle = payload.data.title;
  var notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: 'vibration-sample',
    data: payload.data.link
  };

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  })

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});