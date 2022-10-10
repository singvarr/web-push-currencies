# `web-push-currencies`

## Workflow:

![workflow](https://user-images.githubusercontent.com/56842420/194937213-b29909d2-e73b-447a-b3d4-f4f00e8011b5.png)

## Web API for push notifications

### What we need for Push Notification:

1. Service Workers. Listens to push messages and displays it for active client

#### Notes:

- There is no need to save the subscription on the server side if we have a general subscription. In our case we wan to manage the subscriptions so we need to save subscriptions on the server side.

- VAPID Keys: Voluntary Application Server Identification for Web Push is a spec that allows a backend server(your application server) to identify itself to the Push Service(browser specific service). It is a security measure that prevents anyone else from sending messages to an application’s users.
  You need to generate VAPID public and private Keys.
  Keep your private key safe. Public key can be stored on frontend web app.

2. Notification API. Prompts permission to show notifications

![image](https://user-images.githubusercontent.com/56842420/193760084-3bef9871-e12d-4428-b8c5-cf9e12d1af51.png)

Value of permission can be 'granted', 'default', 'denied':

- granted: user has accepted the request
- default: user has dismissed the notification permission popup by clicking on x
- denied: user has denied the request.

3. Push API. Manages a subscription of user

![image](https://user-images.githubusercontent.com/56842420/193760150-9ad696a2-5e50-4547-819b-a0529a074fc7.png)

## Resources

- [Permission UX](https://web.dev/push-notifications-permissions-ux/)
