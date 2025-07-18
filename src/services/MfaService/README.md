# MfaService

This service provides Multi-Factor Authentication (MFA) functionality using TOTP (Time-based One-Time Password) and QR codes for user accounts. It works with the authentication middleware to secure MFA operations and integrates with the user authentication flow.

## Methods

### `async setup(userId: string)`
Generates a TOTP secret for the user, saves it, and returns the secret and a QR code (as a data URL).
- **API Endpoint:** `POST /mfa/setup`
- **Authentication:** Requires a valid JWT token
- **Request:** Authentication handled via Authorization header (Bearer token)
- **Returns:** `{ secret: string, qr: string }`
- **Throws:** Error if user not found
- **Sample Response:**
  ```json
  {
    "secret": "JBSWY3DPEHPK3PXP",
    "qr": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```

### `async verify(userId: string, token: string)`
Verifies the provided TOTP code for the user. If valid, enables MFA for the user.
- **API Endpoint:** `POST /mfa/verify`
- **Authentication:** Not required (used during MFA setup)
- **Parameters:**
  - `userId` (string): User's ID
  - `token` (string): TOTP code from authenticator app
- **Returns:** `{ success: boolean }`
- **Throws:** Error if MFA not setup
- **Sample Request:**
  ```json
  {
    "token": "123456"
  }
  ```
- **Sample Response:**
  ```json
  {
    "success": true
  }
  ```

### `async disable(userId: string, token: string)`
Disables MFA for the user and removes the TOTP secret after verifying the current MFA token.
- **API Endpoint:** `POST /mfa/disable`
- **Authentication:** Requires a valid JWT token
- **Parameters:**
  - `userId` (string): User's ID
  - `token` (string): TOTP code from authenticator app
- **Request:** Authentication handled via Authorization header (Bearer token)
- **Returns:** `{ success: true }`
- **Throws:** Error if user not found, MFA not setup, or invalid token
- **Sample Request:**
  ```json
  {
    "token": "123456"
  }
  ```
- **Sample Response:**
  ```json
  {
    "success": true
  }
  ```

### `async verifyAndIssueTokens(userId: string, mfaCode: string)`
Verifies the MFA code and, if valid, issues new JWT and refresh tokens for the user.
- **API Endpoint:** `POST /auth/mfa-verify` (integrated with AuthService)
- **Parameters:**
  - `userId` (string): User's ID
  - `mfaCode` (string): TOTP code from authenticator app
- **Returns:** `{ accessToken: string, refreshToken: string }`
- **Throws:** Error if MFA not setup or code is invalid
- **Sample Request:**
  ```json
  {
    "userId": "user-uuid",
    "mfaCode": "123456"
  }
  ```
- **Sample Response:**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "f8e7d6c5b4a3..."
  }
  ```

## Integration with Authentication Flow

The MfaService integrates with the authentication flow as follows:

1. **User Login:** User logs in with username/password through the AuthService
2. **MFA Check:** If MFA is enabled for the user, they receive an `mfaRequired: true` response
3. **MFA Verification:** User submits their MFA code, which is verified by this service
4. **Token Issuance:** Upon successful verification, new access and refresh tokens are issued

## Authentication and Security

- The setup and disable routes are secured with JWT authentication
- The verify route is not secured as it's used during the MFA setup process
- For protected routes, the user ID is extracted from the JWT token
- Authorization header with Bearer token format is required for protected routes:
  ```
  Authorization: Bearer <jwt-token>
  ```

## TOTP Implementation Details

- Uses the industry-standard TOTP algorithm (RFC 6238)
- Default time step: 30 seconds
- Default code digits: 6
- QR code format follows the `otpauth://` URI scheme for compatibility with common authenticator apps

## Dependencies

- [otplib](https://www.npmjs.com/package/otplib) for TOTP generation and verification
- [qrcode](https://www.npmjs.com/package/qrcode) for QR code generation
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) (via utils/jwt) for JWT operations

---

**Note:** All methods are asynchronous and return Promises. Errors are thrown as exceptions and should be handled by the caller.
