import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

/**
 * Validate a request body against a schema, replacing it with the trimmed, defaulted value.
 *
 * @param schema - The schema the body must match
 * @returns Middleware that answers 422 with every problem when the body does not match
 */
export function validateBody<T>(schema: Joi.ObjectSchema<T>) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(request.body ?? {}, { abortEarly: false, stripUnknown: true });

    if (error) {
      response.status(422).json({
        message: "The request body is invalid",
        errors: error.details.map((detail) => ({ field: detail.path.join("."), message: detail.message })),
      });
      return;
    }

    request.body = value;
    next();
  };
}
