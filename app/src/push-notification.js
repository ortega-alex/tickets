import firebase from 'firebase';
import Push from 'push.js';
//import toastr from "toastr";
import http from './services/http.services';

export const initializeFirebase = (_usuario, Server) => {
    try {
        firebase.initializeApp({
            /*apiKey: "AIzaSyAj6cCI-jX3EiEGwu19k_xICWJVrC7qQvo",
            authDomain: "tickets-148b1.firebaseapp.com",
            databaseURL: "https://tickets-148b1.firebaseio.com",
            projectId: "tickets-148b1",
            storageBucket: "tickets-148b1.appspot.com",
            messagingSenderId: "1059815079435",
            appId: "1:1059815079435:web:e3789a01fda2a363"*/


            apiKey: "AIzaSyCJrR_gJVx3D0OXYPfuiMNmdSDg_Mww-_U",
            authDomain: "tickets-45d8c.firebaseapp.com",
            databaseURL: "https://tickets-45d8c.firebaseio.com",
            projectId: "tickets-45d8c",
            storageBucket: "tickets-45d8c.appspot.com",
            messagingSenderId: "648627977033",
            appId: "1:648627977033:web:b16683bfd984600d"
        });

        const messaging = firebase.messaging();

        messaging.requestPermission().then(function () {
            console.log("permisos");
            return messaging.getToken();
        }).then(function (token) {
            console.log(token);
            var data = new FormData();
            data.append('token', token);
            data.append('_usuario', _usuario);
            http._POST(Server + "configuracion/notificaciones.php?accion=set_tocken_web", data).catch(err => {
                console.log("err", err);
            });
        }).catch(function (err) {
            console.log("err firebase: ", err);
        });

        messaging.onMessage(function (payload) {
            const { title, body, icon , link , name } = payload.data;
            //toastr.info(body, title);
            Push.create(title, {
                body: body,
                icon: icon,
                timeout: 10000,
                onClick: function () {
                    window.open(link , name);
                    window.focus();
                    this.close();
                }
            });
        });

        if ('serviceWorker' in navigator) {
            Notification.requestPermission().then(() =>
                navigator.serviceWorker.register('firebase-messaging-sw.js')
                    .then(function (registration) {
                        messaging.useServiceWorker(registration);
                        console.log("This service worker is registered");
                    }).catch(function (err) {
                        console.log('Service worker registration failed, error:', err);
                    })
            ).catch(err => console.log("err service", err))
        }
    } catch (error) {
        console.log("err", error);
    }
}