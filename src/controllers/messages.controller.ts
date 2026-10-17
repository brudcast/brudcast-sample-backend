import type { Request, Response } from "express";
import { welcomeMessage } from "../messages/welcome.message.ts";
import type { AppDeps } from "../types.ts";
import type { WelcomeBody } from "../validators/messages.validator.ts";

const WELCOME_DEEP_LINK = "brudcast-sample://welcome";

/**
 * Build the handlers that send in-app messages.
 *
 * @param deps - The settings and the Brudcast API client
 * @returns The handlers
 */
export function createMessagesController(deps: AppDeps) {
  return {
    /**
     * Send the user a welcome in-app message through the Brudcast API, and answer 202 once
     * Brudcast accepted it.
     *
     * @param request - A request whose body passed `welcomeSchema`
     * @param response - The response
     * @throws {BrudcastApiError} When Brudcast refuses the message
     */
    async welcome(request: Request<unknown, unknown, WelcomeBody>, response: Response): Promise<void> {
      const { externalId } = request.body;
      const message = welcomeMessage({ name: externalId, deepLink: WELCOME_DEEP_LINK });
      const accepted = await deps.client.sendInAppMessage({ applicationId: deps.config.applicationId, externalId, ...message });
      response.status(202).json({ message: "Welcome message sent", brudcast: accepted });
    },
  };
}
