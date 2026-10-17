import express, { type Express } from "express";
import { errorHandler, notFound } from "./middleware/error-handler.ts";
import { createRouter } from "./routes/index.ts";
import type { AppDeps } from "./types.ts";

/**
 * Build the sample backend's Express app: JSON bodies of up to 16 KB, the routes, then a JSON 404
 * and the error handler.
 *
 * @param deps - The settings and a Brudcast API client
 * @returns The app, ready to `listen`
 */
export function createApp(deps: AppDeps): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.use(createRouter(deps));
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
