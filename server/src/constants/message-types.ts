export const messageTypes = [
  "text",
  "audio",
  "image",
  "link",
  "video",
  "document",
  "reply",
  "system",
] as const;

export type MessageType = (typeof messageTypes)[number];
