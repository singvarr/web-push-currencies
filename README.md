# `web-push-currencies`

<!-- TODO: add a separate document: 1. scheme for application  -->
## Workflow:

![workflow](https://user-images.githubusercontent.com/56842420/194937213-b29909d2-e73b-447a-b3d4-f4f00e8011b5.png)

## Web API for push notifications

1. Service Workers. Listens to push messages and displays it for active client

### Notes:

- VAPID keys: Voluntary Application Server Identification for Web Push is a spec that allows a server to authenticate itself to the Push Service.
  You need to generate VAPID public and private Keys.
  - Private key is a secret on the server-side.
  - Public key is be stored on frontend.

2. Notification API. Prompts permission to show notifications

![image](https://user-images.githubusercontent.com/56842420/193760084-3bef9871-e12d-4428-b8c5-cf9e12d1af51.png)

Value of permission can be `granted`, `default`, `denied`. `default` status is assigned when a user has dismissed the permission popup.

3. Push API. Manages a subscription of user

![image](https://user-images.githubusercontent.com/56842420/193760150-9ad696a2-5e50-4547-819b-a0529a074fc7.png)

## Resources

- [Permission UX](https://web.dev/push-notifications-permissions-ux/)

<!-- TODO: why broadcast channel is used - need bidirectional communication -->
<!-- TODO: add a note about push tags -->
## About project

- There is no need to save the subscription on the server side if we have a general subscription. In our case we wan to manage the subscriptions so we need to save subscriptions on the server side.
