import { createHmac } from "node:crypto";

/**
 * Compute the hash that proves to Brudcast a user is who the app says.
 *
 * The SDK sends it with `identify`, and an application that enforces identity verification refuses
 * a session without the right one. Only a server that holds the identity secret can make it, which
 * is why the secret never ships in the app.
 *
 * @param identitySecret - The application's identity secret (`bis_...`), whole
 * @param externalId - Your id for the user, the one the app passes to `identify`
 * @returns The hex HMAC-SHA256 of the external id keyed with the secret
 */
export function userHash(identitySecret: string, externalId: string): string {
  return createHmac("sha256", identitySecret).update(externalId).digest("hex");
}
