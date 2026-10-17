import Joi from "joi";
import { externalIdRule } from "./common.ts";

/**
 * The body of `POST /login`, once validated.
 */
export interface LoginBody {
  userId: string;
  email: string | null;
}

/**
 * `POST /login`: a required user id, and an optional email that is null when missing or blank.
 */
export const loginSchema = Joi.object<LoginBody>({
  userId: externalIdRule.required(),
  email: Joi.string().trim().email({ tlds: { allow: false } }).empty("").allow(null).default(null),
});
