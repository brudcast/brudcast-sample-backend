import Joi from "joi";
import { externalIdRule } from "./common.ts";

/**
 * The body of `POST /welcome`, once validated.
 */
export interface WelcomeBody {
  externalId: string;
}

/**
 * `POST /welcome`: the external id of the user to send the message to.
 */
export const welcomeSchema = Joi.object<WelcomeBody>({
  externalId: externalIdRule.required(),
});
