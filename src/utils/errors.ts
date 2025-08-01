export class AuthError extends Error {}
export class NotFoundError extends AuthError {}
export class InvalidCredentialsError extends AuthError {}
export class TokenExpiredError extends AuthError {}
export class AlreadyVerifiedError extends AuthError {}
export class DisabledAccountError extends AuthError {}
