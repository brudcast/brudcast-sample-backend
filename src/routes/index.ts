import { Router } from "express";
import { createAuthController } from "../controllers/auth.controller.ts";
import { createMessagesController } from "../controllers/messages.controller.ts";
import { validateBody } from "../middleware/validate.ts";
import type { AppDeps } from "../types.ts";
import { loginSchema } from "../validators/auth.validator.ts";
import { welcomeSchema } from "../validators/messages.validator.ts";

/**
 * Build the router with every endpoint, each body checked by its schema before its controller runs.
 *
 * @param deps - The settings and the Brudcast API client
 * @returns The router
 */
export function createRouter(deps: AppDeps): Router {
  const router = Router();
  const auth = createAuthController(deps);
  const messages = createMessagesController(deps);

  router.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  router.post("/login", validateBody(loginSchema), auth.login);
  router.post("/welcome", validateBody(welcomeSchema), messages.welcome);

  return router;
}
