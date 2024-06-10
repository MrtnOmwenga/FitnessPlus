## Fitness+ User Management System Documentation
Welcome to the Users Management System documentation. This system is designed to manage user memberships for fitness+ and send timely reminders to users based on their subscription details. Some memberships are annual with a single upfront payment, while others have monthly dues. Additionally, members can subscribe to optional add-on services (personal training sessions, towel rentals) with separate monthly charges.

### Introduction
The Users Management System is a web application built with NestJS, a powerful Node.js framework, and TypeORM, an ORM for TypeScript and JavaScript. It provides functionalities to manage user data, including membership types, subscription dates, and email notifications.

### Features
- User Management: Create, update, and delete user records.
- Membership Subscription: Track membership subscription details such as start date, due date, and monthly due date.
- Email Notifications: Automatically send email reminders to users based on their subscription status.
- Cron Job: Schedule tasks to run at specific intervals for sending reminders and performing other actions.

### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

### Usage
Once the application is running, you can access the API endpoints to manage users and subscriptions. Here are some key endpoints:

- POST `/api/users`: Create a new user.
- GET `/api/users`: Retrieve a list of all users.
- PUT `/api/users/:id`: Update an existing user by ID.
- DELETE `/api/users/:id`: Delete a user by ID.

### Configuration
The configuration settings for the Users Management System can be found in the .env file. You can customize the database connection, email SMTP settings, and other parameters according to your requirements.

### Contributing
Contributions to the Users Management System are welcome! If you'd like to contribute, please follow these guidelines:

- Fork the repository.
- Create a new branch for your feature or fix.
- Make your changes and commit them with descriptive messages.
- Push your changes to your fork.
- Submit a pull request to the main repository.

### License
This project is licensed under the MIT License.
