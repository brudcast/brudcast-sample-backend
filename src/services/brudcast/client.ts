import axios, { type AxiosInstance } from "axios";
import type { InAppMessageRequest } from "./types.ts";

/**
 * A failed call to the Brudcast API.
 */
export class BrudcastApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  /**
   * @param status - The HTTP status
   * @param body - The decoded response body
   */
  constructor(status: number, body: unknown) {
    super(`Brudcast API responded ${status}: ${JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * How the client is set up.
 */
export interface BrudcastClientOptions {
  /** The API base URL, such as `https://api.brudcast.com/api/v1/user`. */
  apiUrl: string;
  /** An API key with the `messages:send` scope. */
  apiKey: string;
  /** How long to wait for Brudcast before giving up, 10 seconds by default. */
  timeoutMs?: number;
}

/**
 * Calls the Brudcast API with an API key, the way a customer's server does.
 */
export class BrudcastClient {
  private readonly http: AxiosInstance;

  /**
   * @param options - The API base URL, the API key, and an optional timeout
   */
  constructor(options: BrudcastClientOptions) {
    this.http = axios.create({
      baseURL: options.apiUrl,
      timeout: options.timeoutMs ?? 10_000,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        Accept: "application/json",
      },
    });
  }

  /**
   * Send an in-app message to one user, to show the next time their app is open.
   *
   * @param message - The application, the user's external id, the message design, and inbox settings
   * @returns The `data` of the 202 response
   * @throws {BrudcastApiError} When the API refuses the message
   */
  async sendInAppMessage(message: InAppMessageRequest): Promise<Record<string, unknown>> {
    return this.post("/in-app/messages", message);
  }

  /**
   * Send a request and unwrap the response envelope.
   *
   * @param path - The path after the base URL
   * @param body - The JSON body
   * @returns The response's `data`
   * @throws {BrudcastApiError} When Brudcast answers with a status other than 2xx
   */
  private async post(path: string, body: unknown): Promise<Record<string, unknown>> {
    try {
      const response = await this.http.post<{ data?: Record<string, unknown> }>(path, body);
      return response.data?.data ?? {};
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        throw new BrudcastApiError(err.response.status, err.response.data);
      }
      throw err;
    }
  }
}
