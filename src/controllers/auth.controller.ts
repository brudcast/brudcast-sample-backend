import type { Request, Response } from "express";
import { userHash } from "../services/identity.service.ts";
import type { AppDeps } from "../types.ts";
import type { LoginBody } from "../validators/auth.validator.ts";

/**
 * Build the sign-in handlers.
 *
 * `login` stands in for your real sign-in: it trusts the user id it is given. Your backend computes
 * the hash only after it has authenticated the user, so an app can never ask for the hash of
 * someone else.
 *
 * @param deps - The settings
 * @returns The handlers
 */
export function createAuthController(deps: Pick<AppDeps, "config">) {
  return {
    /**
     * Hand the app what `Brudcast.identify` needs: the external id, its hash and the email.
     *
     * @param request - A request whose body passed `loginSchema`
     * @param response - The response
     */
    login(request: Request<unknown, unknown, LoginBody>, response: Response): void {
      const { userId, email } = request.body;
      response.json({ externalId: userId, userHash: userHash(deps.config.identitySecret, userId), email });
    },
  };
}
