# Sample Backend Source Code Documentation

This directory contains the source code for the Sample Authentication API. This document provides an overview of the project structure, components, and their relationships.

## Project Structure

```
src/
├── app.ts                # Main application entry point
├── config/               # Configuration files
├── entities/             # TypeORM entity definitions
├── middleware/           # Custom middleware functions
├── migration/            # Database migrations
├── routes/               # API route definitions
├── services/             # Business logic services
└── utils/                # Utility functions
```

## Components Overview

### Entry Points

- `app.ts`: Main application file that configures Fastify, middleware, and routes
- `index.ts`: Alternative entry point (currently unused)

### Configuration

- `config/database.ts`: TypeORM database connection configuration

### Entity Models

- `entities/User.ts`: User entity with authentication fields
- `entities/Session.ts`: Session entity for refresh token management

### Middleware

- `middleware/auth.ts`: JWT authentication middleware
- `middleware/rateLimit.ts`: Custom rate limiting middleware
- `middleware/validation.ts`: Request validation middleware (stub)

### API Routes

- `routes/auth.ts`: Authentication endpoints
- `routes/mfa.ts`: Multi-factor authentication endpoints
- `routes/users.ts`: User management endpoints (stub)

### Services

- `services/AuthService/`: Authentication service implementation
  - `index.ts`: Main service class
  - `README.md`: Detailed documentation
- `services/MfaService/`: Multi-factor authentication service
  - `index.ts`: Main service class
  - `README.md`: Detailed documentation
- `services/UserService/`: User management service (stub)

### Utilities

- `utils/email.ts`: Email sending functionality
- `utils/jwt.ts`: JWT token generation and verification
- `utils/password.ts`: Password hashing and comparison
- `utils/validation.ts`: Validation helpers (stub)

## Key Functionality

### Authentication

The authentication system provides:
- User registration with email verification
- Login with username/email and password
- JWT-based authentication with refresh tokens
- Session management

### Multi-Factor Authentication

The MFA system provides:
- TOTP (Time-based One-Time Password) implementation
- QR code generation for authenticator apps
- MFA verification during login
- MFA setup and disabling

### Email Verification

Two email verification flows are supported:
1. Code-based verification (primary)
2. Token/link-based verification (alternative)

### Password Reset

Secure password reset flow with:
- OTP (One-Time Password) sent to email
- Time-limited password reset window
- Secure token validation

## Architectural Patterns

The project follows these architectural patterns:
- **Route-Controller-Service**: Routes handle HTTP, Services contain business logic
- **Repository Pattern**: TypeORM repositories for data access
- **Middleware Chain**: Request processing through middleware chains
- **Dependency Injection**: Manual DI for services

## Data Flow

1. Request comes in through a route
2. Middleware processes the request (rate limiting, authentication)
3. Route handler delegates to appropriate service
4. Service performs business logic and data operations
5. Response is returned to the client

## Error Handling

The application uses a consistent error handling approach:
- Services throw errors with optional status codes
- Route handlers catch errors and send appropriate HTTP responses
- Validation errors return 400 Bad Request
- Authentication errors return 401 Unauthorized

## Database Access

TypeORM is used for database access with:
- Entity models for table definitions
- Repository pattern for data operations
- Migrations for schema changes in production

## Service Documentation

For detailed documentation on specific services, refer to:
- [Authentication Service Documentation](services/AuthService/README.md)
- [MFA Service Documentation](services/MfaService/README.md)
