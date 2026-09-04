import type { SignOptions } from 'jsonwebtoken';

const DEFAULT_JWT_EXPIRES_IN = '24h';

function isValidExpiresIn(value: string): boolean {
  if (/^\d+$/.test(value)) {
    return true;
  }

  const ms = require('ms') as (input: string) => number | undefined;
  return ms(value) !== undefined;
}

export function getJwtExpiresIn(): SignOptions['expiresIn'] {
  const raw = process.env.JWT_EXPIRES_IN?.trim();

  if (!raw) {
    return DEFAULT_JWT_EXPIRES_IN;
  }

  if (/^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }

  if (!isValidExpiresIn(raw)) {
    console.warn(
      `Invalid JWT_EXPIRES_IN "${process.env.JWT_EXPIRES_IN}", using default "${DEFAULT_JWT_EXPIRES_IN}"`
    );
    return DEFAULT_JWT_EXPIRES_IN;
  }

  return raw as SignOptions['expiresIn'];
}
