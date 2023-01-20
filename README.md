# User Dashboard Web App

## Production

- [Web APP](https://user-dashboard-production.up.railway.app/)
- [API DOC](https://user-dashboard-production.up.railway.app/apidoc)
  - Using Swagger to generate documentation
  - All APIs are listed in the documentation
  - You can refer to the API documentation and directly test the APIs on the documentation.

## Introduction

- This is a Fullstack Web APP  (Angular + Nest JS, Postgres as Database)

### Angular + Nest JS

- Angular is a widely-used JavaScript framework for building web applications, it provides a powerful template language and a component-based architecture.
- NestJS is a Node.js server-side framework that uses the same concepts as Angular, making it a good choice for building back-end systems that integrate well with Angular front-end.
- Both of them is written in Typescript. Together they offer a seamless development experience for building full-stack JavaScript applications.

## Start The Project in Local

### Installation

```bash
npm install
```

### Prepare Database (Use PostgresSQL)

- use your own Postgres Database
- you can build it with the below docker-compose sample:

  ```docker

  version: "3"
  services:
    db:
      image:  postgres
      restart: always
      ports:
        - "5432:5432"
      environment:
        POSTGRES_PASSWORD: pass123
  ```

  ```bash
  # Start containers in detached / background mode
  docker-compose up -d

  # Stop containers
  docker-compose down
  ```

### Create enviroment variable

```bash
cp .env.example .env
```

- Create a database, and set the name to env variable - PGDATABASE
- Must add the corr

### Execute DB Migration to create tables

```bash
npm run typeorm:run-migrations
```

### Running the app

- Running frontend

  ```bash
  ng build --watch
  ```

- Running backend

  ```bash
  npm run start:dev
  ```

## User Authentication

1. After the user logs in, a new session data is created and a new auth_token is generated.
2. This auth_token is converted to JWT and stored in a cookie. Every time an API receives a request, it checks if there is a token in the cookie.
3. If there is, it will parse the token, obtain the auth_token, and search for the user based on this, setting it on the request for easy use by the controller.
4. Certain APIs require the user to be logged in to be used, so the request is checked for user information, and if there is none, an error is returned.
5. When the user logs out, the session's expiration time is updated to the logout time, invalidating the session.
6. User will automatically login when a valid session is found.

## Database Table Description

### Users (user.entity.ts)

| Column  | Describe|
| -------------:|:-------------|
| id          |a primary key |
| name      | user's name, or obtained from Google or Facebook |
| password |the password of a user account |
| email_verified |  records whether the user's email has been verified  |
|sign_in_count| records the number of sign-ins|
|created_at| the time of user account created|
|updated_at|the latest datetime of data modified|

### Sessions (session.entity.ts)

| Column  | Describe|
| -------------:|:-------------|
| id          | a primary key|
| auth_token      | a random code generated when creating a new session, used to search for corresponding user |
| end_at | the end time of the session, the auth_token will also become invalid after the session ends |
|sign_in_count| records the number of sign-ins|
|created_at| the time of session created|
|updated_at|the latest datetime of data modified|

### Oauth (oauth.entity.ts)

| Column  | Describe|
| -------------:|:-------------|
| id      |a primary key |
| auth_id | the user id obtained from logging in through Google or Facebook |
| source | records whether it is from Google or Facebook |
| user_id |  records which user account it belongs to|
|sign_in_count| records the number of sign-ins|
|created_at| the time of data created|
|updated_at|the latest datetime of data modified|

## Features Description

## Before Sign in

### Sign In

  1. The user must enter their email address and password and send it to the backend for verification.
  2. If the information is incorrect, such as the password being incorrect or the email address not being found, an error message will be returned to the user.

### Sign Up

  1. The user must enter their email address, password, and confirm password.
  2. After submitting, if the backend server finds that the email address is already in use or the password format is incorrect, an error message will be returned to the user to prompt them to make changes.
  3. The email address and password will only be stored in the database if they are confirmed without issues, and an email to verify the email address will be automatically sent to the specified email address.
  4. The user will also be prompted on the screen to click on the verification link in their email to verify the email address, and upon successful verification, they will automatically be logged in.
  5. If the user takes too long to click on the link, they can click on a button to resend the verification email on the same page.
  6. If the user has not yet verified their email address, they will be prompted to do so upon logging in and a button to resend the verification email will be provided.

### Google & Facebook Sign In

  1. The user clicks on the sign in button for Google or Facebook, and after the verification is complete, the frontend will send the obtained token to the backend.
  2. The backend will then decode the token and extract the auth_id, email, and name.
  3. It will then check if there is already an existing record with the auth_id, if so, the user will be logged in and the information will be sent.
  4. If there is no existing record, it will search for the corresponding User data using the email.
  5. If there is User data, a new oauth data will be created and associated with the user.
  6. If there is no User data, a new User will be created and the email verification step will be skipped, and the oauth data will be created.
  7. Finally, the user will be logged in.

### Forgot Password

  1. The user can enter the email address they used during registration, and the backend will first verify if the email address exists in the database.
  2. If it does not exist, an error message will be returned to the user.
  3. If the email address exists, the backend will send a password reset link to the email address provided.
  4. The user will need to click on the link in the email and create a new password.
  5. Once the new password is set, the user will be able to log in using the new password.

----

## After Sign in

### Profile Name

  1. The user can go to the profile page to edit their name.
  2. Users who have signed in with Google or Facebook can also directly edit their name.

### Reset Password

  1. The user can reset their password by entering their old password and new password, and confirming the new password.
  2. Users who have signed in with Google or Facebook do not need to enter a password and therefore cannot use this feature.

### Dashboard

  1. The dashboard displays a list of all users' registration time, login count, and last session time.
  2. At the top of the dashboard, 3 data points will be displayed:
    -  Total number of registered members (including unverified members)
    -  Number of active sessions today (time is based on UTC)
    -  Average number of active sessions in the past 7 days. The calculation is done by taking the number of active sessions per day in the past 7 days, adding them up, and dividing by 7 to get the final average.

## Third Party Service

- [Sendgrid](https://sendgrid.com/)  as mail service

## Modify Database Structure ( Add new table, change column, add index etc)

- The `entity.ts` files are represent a database table or collection.
- You can create a new entity or modify the existed and execute typeorm cli to create new migration file

```bash
npm run typeorm:generate-migration --name=MigrationName
```

- This CLI will automatically check your all entity files and create  corresponding Query in a new migration file

```bash
## run migration script to update the database
npm run typeorm:run-migrations
```

- For more detail, please check the documentation of [Nestjs Database](https://docs.nestjs.com/techniques/database)
