import Joi from "joi";

/**
 * The longest external id Brudcast accepts.
 */
export const MAX_EXTERNAL_ID_LENGTH = 191;

/**
 * A user's external id: trimmed, 1 to 191 characters.
 */
export const externalIdRule = Joi.string().trim().min(1).max(MAX_EXTERNAL_ID_LENGTH);
