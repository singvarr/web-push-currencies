/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import {broadcastChannelTypes, pushNotificationAction} from "./consts";

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== 'navigate') {
      return false;
    } // If this is a URL that starts with /_, skip.

    if (url.pathname.startsWith('/_')) {
      return false;
    } // If this looks like a URL for a resource, because it contains // a file extension, skip.

    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    } // Return true to signal that we want to use the handler.

    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'), // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const broadcastChannel = new BroadcastChannel("BroadcastChannel");
let broadcastMessage

// Creating subscription once Push notification permissions is granted
const createSubscription = async () => {

    const options = {
        applicationServerKey: process.env.REACT_APP_WEB_PUSH_PUBLIC_KEY,
        userVisibleOnly: true
    };

    await self.registration.pushManager.subscribe(options);

    broadcastChannel.postMessage({
        type: broadcastChannelTypes.initialSubscription,
    })
}

broadcastChannel.onmessage = event => {
    const {type} = event.data;

    if (type === broadcastChannelTypes.permissionGranted) {
        createSubscription()
    }
}

// Notification view setting with the title, body (updated currency), image, tag
function showLocalNotification(title, body, tag) {
    const options = {
        body,
        icon: '../images/icon.png',
        actions: [
            {action: pushNotificationAction, title: 'View'}
        ],
        tag
    }
    self.registration.showNotification(title, options)
}

// listener for the getting push data from the Push Manager
self.addEventListener('push', function (event) {
    broadcastMessage = event.data.text()

    const [tag] = broadcastMessage.split(':')
    showLocalNotification('Exchange updates', broadcastMessage, tag)
})


// handler to open App if user click on the "View" button in the push notification message
function openTab(event) {
    broadcastChannel.postMessage({type: broadcastChannelTypes.getPushMessage, payload: broadcastMessage});

    const url = 'http://localhost:8080/';
    event.preventDefault();

    event.waitUntil(
        self.clients.matchAll({type: 'window'}).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                let client = windowClients[i];
                // If so, just focus it.
                if (client.url === url) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
}

// listener for the button click in the Push notification message
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === pushNotificationAction) {
        openTab(event);
    }
}, false);


