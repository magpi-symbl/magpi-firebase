# Magpi - Firebase Cloud Functions for Magpi

[Symbl Docs](https://docs.symbl.ai/docs)

Symbl's APIs empower developers to enable:

- **Real-time** analysis of free-flowing discussions to automatically surface highly relevant summary discussion topics, contextual insights, suggestive action items, follow-ups, decisions, and questions.
- **Voice APIs** that makes it easy to add AI-powered conversational intelligence to either [telephony][telephony] or [WebSocket][websocket] interfaces.
- **Conversation APIs** that provide a REST interface for managing and processing your conversation data.
- **Summary UI** with a fully customizable and editable reference experience that indexes a searchable transcript and shows generated actionable insights, topics, timecodes, and speaker information.

<hr />

## Firebase Cloud Functions for Magpi

<hr />

- [Introduction](#introduction)
- [Pre-requisites](#pre-requisites)
- [Features](#features)
- [Browser Support](#browsersupport)
- [Setup and Deploy](#setupanddeploy)
- [Dependencies](#dependencies)
- [Conclusion](#conclusion)
- [Community](#community)

## Introduction

This app contains firebase cloud function which [Magpi][magpi] app would require to Authenticate Symbl/Zoom and Pick Magpi app as a trigger, which will kick off automation
The data is stored in Firebase back-end firestore servers and is built using React App.

## Pre-requisites

- JS ES6+/Typescript
- [Node.js v10+](https://nodejs.org/en/download/)\*
- User should have Zoom Business/Pro Account for Auto Transcript of Zoom Meetings and must have enabled permissions for Recording and Transcription(https://zoom.us/signup)
- The Firebase Project should be setup with following enabled

- Realtime Database
- Hosting- (Optional)
- Authentication
- Storage

Make sure to select Blaze Plan to enabled Cloud Functions.

## Features

This Firebase Cloud Functions App primarily performs these 4 functions

- fetchAccessToken - to fetch the Symbl Access Token
- fetchZoomUserDetails - To fetch the Details of the Logged in Zoom user for Magpi App
- symblCallback - http call for Symbl to callback for Updating the job status
- zoomEvents - Every time a Recording is saved in the User's Zoom account - this performs the task of Storing that recording on Cloud Storage and
  passing the same to Symbl for Cloud Transcription

## Browser Support

NA

## Setup and Deploy

-The first step to getting setup is to [sign up][signup] on Symbl and Generate App ID And App Secret
Store Your Symbl App Id and App Secret using the below commands in firebase config params

$ firebase functions:config:set magpi.app_id= App ID for Symbl

$ firebase functions:config:set magpi.app_secret= App Secret for Symbl

-Setup the Symbl Url using the below commands:

$ firebase functions:config:set magpi.symbl_url=https://api.symbl.ai/

$ firebase functions:config:set magpi.token_path=oauth2/token:generate

-Create new OAuth application from Zoom Marketplace -(https://marketplace.zoom.us/develop/create)

$ firebase functions:config:set zoom.clientid= Client Id for your Zoom MarketPlace App

$ firebase functions:config:set zoom.clientsecret= Client Secret for your Zoom MarketPlace App

## Setup for Firebase and GCP

$ firebase functions:config:set firebase.cloud_base_url= Base Url for your cloud functions

$ firebase functions:config:set zoom.app_base_url= Base Url for the app

$ firebase functions:config:set zoom.gcp_bucket=GCP Bucket

## Setup Your firebase Cloud Functions

    $ npm install -g firebase-tools
    $ firebase login
    $ firebase use --add
    Add the firebase Project you created. This should add an entry in .firebaserc
    To deploy the cloud functions on your Project
    $ firebase deploy --only functions

## Dependencies

```json
   "dependencies": {
    "@types/jwt-decode": "^3.1.0",
    "axios": "^0.21.1",
    "cors": "^2.8.5",
    "express": "^4.17.1",
    "firebase-admin": "^9.2.0",
    "firebase-functions": "^3.11.0",
    "symbl-node": "^1.0.13",
    "uuid": "^8.3.2"
  },
  "devDependencies": {
    "@types/node-fetch": "^2.5.10",
    "@types/uuid": "^8.3.0",
    "@typescript-eslint/eslint-plugin": "^3.9.1",
    "@typescript-eslint/parser": "^3.8.0",
    "firebase-functions-test": "^0.2.0",
    "typescript": "^3.8.0"
  }
```

## Conclusion

This repository contains the firebase cloud functions only and once all the steps are complete, user should see cloud functions deployed to Firebase console.
To Test these cloud functions. Please setup and run Magpi App situated at

## Community

If you have any questions, feel free to reach out to us at magpi@symbl.ai
This guide is actively developed, and we love to hear from you! Please feel free to [create an issue][issues] or [open a pull request][pulls] with your questions, comments, suggestions and feedback. If you liked our integration guide, please star our repo!

This library is released under the [Apache License][license]

[license]: LICENSE.txt
[signup]: https://platform.symbl.ai/?_ga=2.63499307.526040298.1609788827-1505817196.1609788827
[issues]: https://github.com/magpi-symbl/magpi-firebase/issues
[pulls]: https://github.com/magpi-symbl/magpi-firebase/pulls
[magpi]: https://github.com/magpi-symbl/magpi-react
