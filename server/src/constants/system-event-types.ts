export const directEventTypes = [
  "user_blocked",
  "user_unblocked",
  "message_unsent",
  "chat_cleared",
  "chat_deleted",
  "archived",
  "chat_muted",
] as const;

export type DirectSystemEventType = (typeof directEventTypes)[number];

export const groupEventTypes = [
  "user_added",
  "user_removed",
  "user_left",
  "group_renamed",
  "group_created",
  "admin_assigned",
  "admin_removed",
  "group_icon_changed",
  "group_description_updated",
  "message_pinned",
] as const;

export type GroupSystemEventType = (typeof groupEventTypes)[number];
