# `web-push-currencies`

## Workflow:

[The app flow - Miro board](https://miro.com/welcomeonboard/Y0NNS3I3UmN0cDRxVGo0clBNR3NXNTJvYVVmekpUSkluNXY5RGFFNjJwZGZGZ1BjQkhOOVZES3BtTlJhRHR1anwzNDU4NzY0NTI2NjQxMTIzNzIwfDI=?share_link_id=609544899592)
![Push notification workflow](https://user-images.githubusercontent.com/56842420/221139061-e5420dac-c50a-4c2b-91f8-782721bb3640.jpg)


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

## About project

- There is no need to save the subscription on the server side if we have a general subscription. In our case we wan to manage the subscriptions so we need to save subscriptions on the server side.

  [The app flow - Miro board](https://miro.com/welcomeonboard/V2dTNkhaWUhCekZGSWNOOFVrYWo5b1VJeng0SzNIS0xpVFRPbTJHdElVM2hJWktTYVd2UGJ0N256QkRNUmVyYnwzNDU4NzY0NTI2NjQxMTIzNzIwfDI=?share_link_id=197611904681)
![App workflow](https://user-images.githubusercontent.com/56842420/219964670-2bb09d2c-15fd-4d18-9376-3c8f57dc494e.jpg)

