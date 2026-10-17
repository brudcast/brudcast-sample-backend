/**
 * A text block's look. Null fields use the SDK's defaults.
 */
export interface TextStyle {
  size: number | null;
  weight: "regular" | "medium" | "bold";
  align: "left" | "center" | "right";
  color: string | null;
  darkColor: string | null;
}

/**
 * What a button does when tapped.
 */
export interface ButtonAction {
  type: "deeplink" | "url" | "dismiss";
  value: string | null;
  target: string | null;
}

/**
 * One piece of a message: a line of text or a button.
 */
export type Block =
  | { id: string; type: "text"; role: "title" | "body" | "caption"; text: string; style: TextStyle }
  | { id: string; type: "button"; label: string; action: ButtonAction; style: { variant: "primary" | "secondary" | "text" } };

/**
 * An in-app message's design, in the format the dashboard's message builder produces.
 */
export interface InAppDesign {
  schemaVersion: 1;
  format: "modal" | "banner" | "fullscreen";
  layout: {
    position: "top" | "center" | "bottom";
    dismissible: boolean;
    overlay: { color: string; opacity: number };
    background: { color: string; imageUrl: string | null };
    cornerRadius: number;
    padding: number;
    darkMode: { backgroundColor: string };
    autoDismissSeconds: number | null;
    bannerAction: ButtonAction | null;
  };
  blocks: Block[];
}

/**
 * Whether a message also stays in the user's inbox, and how it is listed there.
 */
export interface InboxSettings {
  addToInbox: boolean;
  title: string;
  preview: string;
  expiresInDays: number;
}

/**
 * The body of `POST /in-app/messages`.
 */
export interface InAppMessageRequest {
  applicationId: string;
  externalId: string;
  design: InAppDesign;
  inbox?: InboxSettings;
}
