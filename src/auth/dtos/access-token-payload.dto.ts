export class AccessTokenPayload {
  sub: number; // Subject - user id.
  jti: string; // JWT ID - unique identifier for JWT access token.
  given_name: string; // First name.
  roles: string[]; // Format is 'section.permission'.
}
