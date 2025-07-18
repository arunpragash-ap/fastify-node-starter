# AuthService

This service provides authentication and user account management logic for the backend. It handles registration, login, JWT/session management, email verification, and password reset flows.

## Methods

### `registerWithCode({ username, email, password })`
Registers a new user, sends a 6-character email verification code, and returns basic user info.
- **API Endpoint:** `POST /auth/register`
- **Parameters:**
  - `username` (string): Desired username
  - `email` (string): User's email address
  - `password` (string): User's password
- **Returns:** `{ id, email, username }`
- **Throws:** Error if user already exists
- **Sample Request:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "MySecret123!"
  }
  ```
- **Sample Response:**
  ```json
  {
    "id": "user-uuid",
    "email": "john@example.com",
    "username": "johndoe"
  }
  ```

### `verifyEmailWithCode({ email, code })`
Verifies a user's email using a 6-character code sent to their email address.
- **API Endpoint:** `POST /auth/email/verify-code`
- **Parameters:**
  - `email` (string): The user's email
  - `code` (string): The 6-character verification code
- **Returns:** `true` on success
- **Throws:** Error if code is invalid, expired, or email is already verified
- **Sample Request:**
  ```json
  {
    "email": "john@example.com",
    "code": "A1b2C3"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

### `resendVerificationCode({ email })`
Resends a new 6-character email verification code to the user's email address.
- **API Endpoint:** `POST /auth/email/resend-code`
- **Parameters:**
  - `email` (string): The user's email
- **Returns:** `true` on success
- **Throws:** Error if user not found or already verified
- **Sample Request:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

### `loginWithMfaSupport({ identifier, password })`
Authenticates a user by username or email and password. If MFA is enabled, returns a short-lived MFA token and indicates that MFA is required. Otherwise, issues JWT and refresh token.
- **API Endpoint:** `POST /auth/login`
- **Parameters:**
  - `identifier` (string): Username or email
  - `password` (string): User's password
- **Returns:**
  - If MFA is not enabled: `{ accessToken, refreshToken }`
  - If MFA is enabled: `{ mfaRequired: true, mfaToken }`
- **Throws:** Error if credentials are invalid, account is disabled, or email is not verified
- **Sample Request:**
  ```json
  {
    "identifier": "johndoe",
    "password": "MySecret123!"
  }
  ```
- **Sample Response (no MFA):**
  ```json
  {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
  ```
- **Sample Response (MFA enabled):**
  ```json
  {
    "mfaRequired": true,
    "mfaToken": "short-lived-mfa-token"
  }
  ```

### `mfaVerify({ mfaToken, mfaCode })`
Verifies the user's MFA code and, if valid, issues JWT and refresh token.
- **API Endpoint:** `POST /auth/mfa-verify`
- **Parameters:**
  - `mfaToken` (string): The short-lived MFA token returned from login
  - `mfaCode` (string): The TOTP code from the user's authenticator app
- **Returns:** `{ accessToken, refreshToken }` on success
- **Throws:** Error if MFA token or code is invalid or expired
- **Sample Request:**
  ```json
  {
    "mfaToken": "short-lived-mfa-token",
    "mfaCode": "123456"
  }
  ```
- **Sample Response:**
  ```json
  {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
  ```

### `refresh({ refreshToken })`
Issues a new JWT access token using a valid refresh token.
- **API Endpoint:** `POST /auth/refresh`
- **Parameters:**
  - `refreshToken` (string): The refresh token
- **Returns:** `{ accessToken }`
- **Throws:** Error if refresh token is invalid or expired
- **Sample Request:**
  ```json
  {
    "refreshToken": "refresh-token"
  }
  ```
- **Sample Response:**
  ```json
  {
    "accessToken": "new-jwt-token"
  }
  ```

### `logout({ refreshToken })`
Invalidates a refresh token (logs the user out from that session).
- **API Endpoint:** `POST /auth/logout`
- **Parameters:**
  - `refreshToken` (string): The refresh token to invalidate
- **Returns:** `true` on success
- **Sample Request:**
  ```json
  {
    "refreshToken": "refresh-token"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

### `sendEmailVerification({ userId })`
Sends (or resends) an email verification link to the user. (Token-based verification, for legacy or alternative flows.)
- **API Endpoint:** `POST /auth/email/send-verification`
- **Parameters:**
  - `userId` (string): The user's ID
- **Returns:** `true` on success
- **Throws:** Error if user not found
- **Sample Request:**
  ```json
  {
    "userId": "user-uuid"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

### `verifyEmail({ token })`
Verifies a user's email using a verification token (for legacy or alternative flows).
- **API Endpoint:** `POST /auth/email/verify`
- **Parameters:**
  - `token` (string): The email verification token
- **Returns:** `true` on success
- **Throws:** Error if token is invalid or expired
- **Sample Request:**
  ```json
  {
    "token": "email-verification-token"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

### `forgotPassword({ email })`
Sends a password reset OTP to the user's email address.
- **API Endpoint:** `POST /auth/forgot-password`
- **Parameters:**
  - `email` (string): The user's email
- **Returns:** `true` on success
- **Throws:** Error if user not found
- **Sample Request:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

### `resetPassword({ email, otp, newPassword })`
Resets the user's password after verifying the OTP sent to their email.
- **API Endpoint:** `POST /auth/forgot-password/verify`
- **Parameters:**
  - `email` (string): The user's email
  - `otp` (string): The OTP sent to the user's email
  - `newPassword` (string): The new password
- **Returns:** `true` on success
- **Throws:** Error if OTP is invalid or expired
- **Sample Request:**
  ```json
  {
    "email": "john@example.com",
    "otp": "123456",
    "newPassword": "NewSecret123!"
  }
  ```
- **Sample Response:**
  ```json
  true
  ```

---

**Note:** All methods are asynchronous and return Promises. Errors are thrown as exceptions and should be handled by the caller.

## Email Verification Flows

There are two supported email verification flows:

1. **6-Character Code (default):**
   - On registration, a 6-character code is sent to the user's email.
   - The user verifies their email by submitting the code via `POST /auth/email/verify-code`.
   - The code can be resent using `POST /auth/email/resend-code`.

2. **Token/Link (alternative/legacy):**
   - A verification link with a token can be sent using `POST /auth/email/send-verification`.
   - The user verifies their email by submitting the token via `POST /auth/email/verify`.

Choose the flow that matches your frontend and user experience.

## Login and MFA Flow

1. User submits their identifier (username or email) and password to `/auth/login`.
2. If MFA is **not** enabled, the user receives `accessToken` and `refreshToken`.
3. If MFA **is** enabled, the user receives `mfaRequired: true` and a short-lived `mfaToken`.
4. The user must then submit their `mfaToken` and their TOTP code to `/auth/mfa-verify`.
5. If the code is valid, the user receives `accessToken` and `refreshToken`.
