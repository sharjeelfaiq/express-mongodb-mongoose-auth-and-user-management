# Backend

Node.js backend application with Express.js for authentication, user management, and email services.

## Prerequisites

- Node.js (v16+)
- MongoDB database
- Environment variables configured

## Installation

```bash
npm install
```

## Scripts

- **`npm start`** - Production server
- **`npm run dev`** - Development server with hot reload
- **`npm run format`** - Format code with Prettier
- **`npm run seed`** - Seed database with initial data
- **`npm run lint`** - Check code quality with ESLint

## Environment Setup

Configure required environment variables before running the application.

## API Documentation

Interactive Swagger documentation available at:

```
http://localhost:5000/api-docs
```

## Project Structure

ES6 modules with import mapping:

```
🗂️ express-mongodb-mongoose-auth-and-user-management
├── 🗂️ docs
│   └── 🗂️ swagger
│       ├── 🗂️ auth
│       │   └── 📄 index.yaml
│       ├── 🗂️ email
│       │   └── 📄 index.yaml
│       ├── 🗂️ health
│       │   └── 📄 index.yaml
│       ├── 🗂️ notifications
│       │   └── 📄 index.yaml
│       ├── 🗂️ users
│       │   └── 📄 index.yaml
│       └── 📄 common.yaml
├── 🗂️ src
│   ├── 🗂️ config
│   │   ├── 📄 cloudinary.config.js
│   │   ├── 📄 database.config.js
│   │   ├── 📄 env.config.js
│   │   ├── 📄 index.js
│   │   ├── 📄 logger.config.js
│   │   ├── 📄 mail.config.js
│   │   └── 📄 swagger.config.js
│   ├── 🗂️ constants
│   │   └── 📄 index.js
│   ├── 🗂️ data-access
│   │   ├── 📄 blacklisted-token.data-access.js
│   │   ├── 📄 index.js
│   │   ├── 📄 notification.data-access.js
│   │   ├── 📄 otp.data-access.js
│   │   └── 📄 user.data-access.js
│   ├── 🗂️ dtos
│   │   ├── 📄 auth.dto.js
│   │   ├── 📄 index.js
│   │   └── 📄 validations.js
│   ├── 🗂️ middleware
│   │   ├── 📄 global.middleware.js
│   │   ├── 📄 index.js
│   │   ├── 📄 upload.middleware.js
│   │   └── 📄 validate.middleware.js
│   ├── 🗂️ models
│   │   ├── 📄 blacklisted-token.model.js
│   │   ├── 📄 index.js
│   │   ├── 📄 notification.model.js
│   │   ├── 📄 otp.model.js
│   │   └── 📄 user.model.js
│   ├── 🗂️ modules
│   │   ├── 🗂️ auth
│   │   │   ├── 📄 auth.controllers.js
│   │   │   ├── 📄 auth.routes.js
│   │   │   └── 📄 auth.services.js
│   │   ├── 🗂️ email
│   │   │   ├── 📄 email.controllers.js
│   │   │   ├── 📄 email.routes.js
│   │   │   └── 📄 email.services.js
│   │   ├── 🗂️ health
│   │   │   ├── 📄 health.controllers.js
│   │   │   ├── 📄 health.routes.js
│   │   │   └── 📄 health.services.js
│   │   ├── 🗂️ notification
│   │   │   ├── 📄 notification.controllers.js
│   │   │   ├── 📄 notification.routes.js
│   │   │   └── 📄 notification.services.js
│   │   ├── 🗂️ otp
│   │   │   ├── 📄 otp.controllers.js
│   │   │   ├── 📄 otp.routes.js
│   │   │   └── 📄 otp.services.js
│   │   ├── 🗂️ user
│   │   │   ├── 📄 user.controllers.js
│   │   │   ├── 📄 user.routes.js
│   │   │   └── 📄 user.services.js
│   │   └── 📄 index.js
│   ├── 🗂️ routes
│   │   └── 📄 index.js
│   ├── 🗂️ server
│   │   └── 📄 index.js
│   ├── 🗂️ utils
│   │   ├── 📄 email.utils.js
│   │   ├── 📄 global.utils.js
│   │   ├── 📄 index.js
│   │   ├── 📄 otp.utils.js
│   │   ├── 📄 token.utils.js
│   │   └── 📄 username.utils.js
│   ├── 🗂️ views
│   │   ├── 🗂️ otp-email
│   │   │   └── 📄 index.html
│   │   ├── 🗂️ reset-password
│   │   │   └── 📄 index.html
│   │   ├── 🗂️ verification-email
│   │   │   └── 📄 index.html
│   │   └── 🗂️ verification-notification
│   │       └── 📄 index.html
│   └── 📄 index.js
├── 📄 eslint.config.js
├── 📄 nodemon.json
├── 📄 package-lock.json
├── 📄 package.json
└── 📄 README.md
```

## Core Dependencies

- Express.js (v4.21.2)
- Mongoose (v8.9.6)
- JWT (v9.0.2)
- Bcrypt.js (v2.4.3)
- Joi (v17.13.3)
- Nodemailer (v6.10.0)

## Author

**Sharjeel Faiq**
