import jwt from "jsonwebtoken";

export const SESSION_COOKIE_NAME = "eml_session";
const FALLBACK_SECRET = "dev-secret-change-later";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET ?? FALLBACK_SECRET;

  if (process.env.NODE_ENV === "production" && secret === FALLBACK_SECRET) {
    throw new Error("JWT_SECRET must be set in production.");
  }

  return secret;
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, getJwtSecret(), {
    audience: "eml-composer",
    expiresIn: "7d",
    issuer: "eml-composer-game"
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, getJwtSecret(), {
    audience: "eml-composer",
    issuer: "eml-composer-game"
  }) as { sub: string };
}
