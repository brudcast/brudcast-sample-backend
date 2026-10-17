import type { ErrorRequestHandler, RequestHandler } from "express";
import { BrudcastApiError } from "../services/brudcast/client.ts";

/**
 * Answer requests no route matched with a JSON 404.
 */
export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ message: "Not found" });
};

/**
 * Turn a thrown error into a JSON response: Brudcast's refusals as 502, bodies Express could not
 * read as 400 or 413, and anything else as 500.
 */
export const errorHandler: ErrorRequestHandler = (err, _request, response, _next) => {
  if (err instanceof BrudcastApiError) {
    response.status(502).json({ message: "Brudcast refused the request", brudcast: err.body });
    return;
  }

  const type = (err as { type?: string }).type;
  if (type === "entity.parse.failed") {
    response.status(400).json({ message: "The body must be JSON" });
    return;
  }
  if (type === "entity.too.large") {
    response.status(413).json({ message: "The body is too large" });
    return;
  }

  console.error(err);
  response.status(500).json({ message: "Something went wrong" });
};
