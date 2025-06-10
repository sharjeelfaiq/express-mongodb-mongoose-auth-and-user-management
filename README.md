# Romulus Backend

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
src/
├── config/     # Application configuration
├── constants/  # Application constants
├── data-access/# Database access layer
├── dtos/       # Data transfer objects
├── middleware/ # Express middleware
├── models/     # Database models
├── modules/    # Feature modules
├── routes/     # API route definitions
├── server/     # Server configuration
├── utils/      # Utility functions
└── scripts/    # Maintenance scripts
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