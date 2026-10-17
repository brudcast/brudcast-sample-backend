import type { InAppDesign, InboxSettings } from "../services/brudcast/types.ts";

/**
 * What the welcome message needs to know.
 */
export interface WelcomeMessageParams {
  /** What to call the user. */
  name: string;
  /** Where the main button leads. */
  deepLink: string;
}

/**
 * Build the welcome message a new user gets after signing in: a modal with a deep link back into
 * the app, also kept in the inbox.
 *
 * @param params - What to call the user, and where the main button leads
 * @returns The design and inbox settings for `POST /in-app/messages`
 */
export function welcomeMessage(params: WelcomeMessageParams): { design: InAppDesign; inbox: InboxSettings } {
  return {
    design: {
      schemaVersion: 1,
      format: "modal",
      layout: {
        position: "center",
        dismissible: true,
        overlay: { color: "#000000", opacity: 0.5 },
        background: { color: "#FFFFFF", imageUrl: null },
        cornerRadius: 16,
        padding: 24,
        darkMode: { backgroundColor: "#111111" },
        autoDismissSeconds: null,
        bannerAction: null,
      },
      blocks: [
        {
          id: "title",
          type: "text",
          role: "title",
          text: `Welcome, ${params.name}`,
          style: { size: null, weight: "bold", align: "center", color: null, darkColor: null },
        },
        {
          id: "body",
          type: "text",
          role: "body",
          text: "Your account is ready. This message came from your own backend through the Brudcast API.",
          style: { size: null, weight: "regular", align: "center", color: null, darkColor: null },
        },
        {
          id: "start",
          type: "button",
          label: "Get started",
          action: { type: "deeplink", value: params.deepLink, target: null },
          style: { variant: "primary" },
        },
        {
          id: "later",
          type: "button",
          label: "Not now",
          action: { type: "dismiss", value: null, target: null },
          style: { variant: "text" },
        },
      ],
    },
    inbox: {
      addToInbox: true,
      title: `Welcome, ${params.name}`,
      preview: "Your account is ready.",
      expiresInDays: 30,
    },
  };
}
