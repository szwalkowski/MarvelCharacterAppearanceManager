# MarvelCharacterAppearanceManager

Applications helps you manage your reading when focusing specific characters. 
Find all appearances of specific characters and mark them as read.

## Requiments to run it locally
- Server of MongoDB (can be local) - 4.2+
- npm (6.13)
- firebase account and authentication system for creating users (in future it might be not necesary if it wont be deployed anywhere)

## Properties needed:
- Please set env variables for nodeJS server:
  - MCAM_DB_IP - server IP with MongoDB
  - MCAM_DB_PORT - port to MongoDB
  - MCAM_DB_NAME - database name in MongoDB
  - MCAM_DB_USER - user that has access to above specific database
  - MCAM_DB_PWD - password of that user
  - MCAM_FIREBASE_DB_URL - url to your firebase project (https://\<projectname\>.firebaseio.com)
  - FIREBASE_API_KEY - api key to firebase
- In frontend folder, there is .env file (if using google auth)
  - VUE_APP_FIREBASE_AUTH_DOMAIN - url to your firebase project (https://\<projectname\>.firebaseio.com)
  - VUE_APP_FIREBASE_API_KEY - api key to firebase
  
## How to run:
- Run Node.JS server starting from app.js
- Run "run serve" in frontend for Vue.js server
