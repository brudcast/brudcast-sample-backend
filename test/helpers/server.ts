import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

/**
 * Start a server on a free local port.
 *
 * @param server - The server
 * @returns Its base URL
 */
export async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

/**
 * POST a JSON body.
 *
 * @param url - Where to
 * @param body - The body, sent as JSON
 * @returns The response
 */
export function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
