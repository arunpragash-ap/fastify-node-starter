# Sample API

Sample API is a secure authentication and user management backend service built with Fastify, TypeORM, and MySQL. It provides a complete solution for user registration, authentication, multi-factor authentication (MFA), session management, and secure password recovery flows.

## Features

- 🔒 Secure user authentication
- 👥 User management
- 🔑 JWT-based authentication
- 📱 Multi-factor authentication (TOTP)
- ✉️ Email verification
- 🔄 Password reset flow
- 🚫 Rate limiting
- 🛡️ Session management
- 📊 RESTful API

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Development](#development)
  - [Production](#production)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Authentication Flow](#authentication-flow)
- [Service Documentation](#service-documentation)
- [Architecture](#architecture)
- [Security](#security)
- [Development Standards](#development-standards)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- MySQL >= 8.0

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables (see below)
4. Start the development server:

```bash
pnpm dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=sample
DB_PASSWORD=sample_password
DB_DATABASE=sample_management

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m

# CORS
CORS_ORIGIN=http://localhost:3001

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM=noreply@example.com

# Frontend
FRONTEND_URL=http://localhost:3001
```

## Usage

### Development

Start the development server with auto-reload:

```bash
pnpm dev
```

### Production

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Environment Configuration

For production deployment, consider the following best practices:
- Use a strong, randomly generated JWT secret
- Configure proper CORS settings for your domain
- Use a production SMTP service
- Set up database connection pooling
- Enable SSL for database connections

## Database

The application uses MySQL with TypeORM. The database schema is automatically managed by TypeORM's synchronize feature in development mode.

For production, it's recommended to use migrations:

```bash
npx typeorm migration:generate -n MigrationName
npx typeorm migration:run
```

## API Documentation

### Core Endpoints

| Method | Endpoint                      | Description                      | Authentication |
|--------|-------------------------------|----------------------------------|---------------|
| GET    | /health                       | Health check                     | None          |
| POST   | /auth/register                | Register a new user              | None          |
| POST   | /auth/login                   | Login                            | None          |
| POST   | /auth/mfa-verify              | Verify MFA code                  | None          |
| POST   | /auth/refresh                 | Refresh access token             | None          |
| POST   | /auth/logout                  | Logout                           | None          |
| POST   | /auth/email/verify-code       | Verify email with code           | None          |
| POST   | /auth/email/resend-code       | Resend verification code         | None          |
| POST   | /auth/forgot-password         | Request password reset           | None          |
| POST   | /auth/forgot-password/verify  | Verify OTP and reset password    | None          |
| POST   | /auth/mfa/setup               | Setup MFA                        | JWT           |
| POST   | /auth/mfa/verify              | Verify MFA setup                 | JWT           |
| POST   | /auth/mfa/disable             | Disable MFA                      | JWT           |
| GET    | /auth/mfa/status              | Get MFA status                   | JWT           |

### API Examples

#### Registration

```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123!"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered. Please check your email for the verification code."
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "johndoe",
  "password": "securePassword123!"
}
```

Response (without MFA):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "f8e7d6c5b4a3..."
}
```

Response (with MFA enabled):
```json
{
  "mfaRequired": true,
  "mfaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### MFA Verification

```http
POST /auth/mfa-verify
Content-Type: application/json

{
  "mfaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mfaCode": "123456"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "f8e7d6c5b4a3..."
}
```

For detailed API documentation including request/response formats, refer to the Postman collection included in the repository (`backend_auth_api.postman_collection.json`).

## Authentication Flow

### Registration Flow
1. User registers with email, username, and password
2. A 6-character verification code is sent to the user's email
3. User verifies email by submitting the code

### Login Flow
1. User submits identifier (username or email) and password
2. If MFA is not enabled, user receives access and refresh tokens
3. If MFA is enabled, user receives an MFA token
4. User submits MFA token and TOTP code
5. Upon successful verification, user receives access and refresh tokens

### Password Reset Flow
1. User requests password reset by providing email
2. A 6-digit OTP is sent to user's email
3. User submits email, OTP, and new password
4. Password is reset if OTP is valid

## Architecture

### System Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  Frontend   │<─────│  Sample API │<─────│   MySQL     │
│  Client     │─────>│  Backend    │─────>│  Database   │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
                           │
                           │
                     ┌─────▼─────┐
                     │           │
                     │  Email    │
                     │  Service  │
                     │           │
                     └───────────┘
```

### Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│ Fastify Application                                      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │             │  │             │  │             │      │
│  │   Routes    │──│  Services   │──│ Data Access │      │
│  │             │  │             │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│         │                │                │              │
│         │                │                │              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │             │  │             │  │             │      │
│  │ Middleware  │  │  Utilities  │  │   TypeORM   │      │
│  │             │  │             │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
┌─────────┐                  ┌─────────┐                  ┌─────────┐
│         │                  │         │                  │         │
│ Client  │                  │  API    │                  │ Database│
│         │                  │         │                  │         │
└────┬────┘                  └────┬────┘                  └────┬────┘
     │                            │                            │
     │  POST /auth/login          │                            │
     │ ─────────────────────────> │                            │
     │                            │                            │
     │                            │  Query User                │
     │                            │ ─────────────────────────> │
     │                            │                            │
     │                            │  Return User               │
     │                            │ <─────────────────────────┐│
     │                            │                            │
     │                            │  Verify Password           │
     │                            │ ──┐                        │
     │                            │   │                        │
     │                            │ <─┘                        │
     │                            │                            │
     │                            │  Check MFA Status          │
     │                            │ ──┐                        │
     │                            │   │                        │
     │                            │ <─┘                        │
     │                            │                            │
     │  If MFA enabled:           │                            │
     │  mfaRequired + mfaToken    │                            │
     │ <─────────────────────────┐│                            │
     │                            │                            │
     │  POST /auth/mfa-verify     │                            │
     │ ─────────────────────────> │                            │
     │                            │                            │
     │                            │  Verify MFA Code           │
     │                            │ ──┐                        │
     │                            │   │                        │
     │                            │ <─┘                        │
     │                            │                            │
     │  If no MFA or MFA verified:│                            │
     │  JWT + Refresh Token       │                            │
     │ <─────────────────────────┐│                            │
     │                            │                            │
     │                            │  Store Session             │
     │                            │ ─────────────────────────> │
     │                            │                            │
     │                            │  Session Stored            │
     │                            │ <─────────────────────────┐│
     │                            │                            │
```

## Service Documentation

For a complete overview of the project structure and architecture, refer to the [Source Code Documentation](src/README.md).

For detailed documentation on specific services, refer to the following guides:

- [Authentication Service Documentation](src/services/AuthService/README.md)
- [MFA Service Documentation](src/services/MfaService/README.md)

## Security

- Password hashing using bcrypt
- JWT-based authentication
- Rate limiting to prevent brute-force attacks
- Session management with refresh tokens
- MFA using TOTP (Time-based One-Time Password)
- Email verification
- Secure password reset flow

### Security Flow Diagram

```
┌─────────────────────────┐
│   Client Request         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Rate Limiting          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   CORS Validation        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   JWT Authentication     │──┐
└───────────┬─────────────┘  │
            │                │
            │                │ Verify
            │                │ Token
            │                │
            │                ▼
            │     ┌─────────────────────┐
            │     │ Token Verification  │
            │     └─────────┬───────────┘
            │               │
            │               ▼
            │     ┌─────────────────────┐
            │     │   User Lookup       │
            │     └─────────┬───────────┘
            │               │
            ▼               │
┌─────────────────────────┐ │
│   Business Logic         │◄┘
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Response               │
└─────────────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## Development Standards

### Code Style
- Follow TypeScript best practices
- Use asynchronous patterns with async/await
- Use meaningful variable and function names
- Add comments for complex logic

### Error Handling
- Use proper error codes and messages
- Implement comprehensive error handling
- Log errors appropriately

### Security
- Follow OWASP security guidelines
- Never store sensitive information in plaintext
- Always validate user input
- Use parameterized queries for database operations

### Testing
- Write unit tests for all services
- Test API endpoints with integration tests
- Run security audits regularly

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check database credentials in .env file
   - Verify MySQL service is running
   - Ensure database exists and user has proper permissions

2. **Email Sending Failures**
   - Verify SMTP credentials
   - Check for firewall blocking SMTP ports
   - Try using a different email service provider

3. **JWT Authentication Issues**
   - Ensure JWT_SECRET is properly set
   - Check token expiration time settings
   - Verify client is sending the token correctly

For more help, check the [issues section](https://github.com/yourusername/sample/issues) of the repository.

## License

This project is licensed under the ISC License.

---

*Last updated: August 2023*
