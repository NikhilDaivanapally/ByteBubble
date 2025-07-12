export const DirectSystemEventType = {
  USER_BLOCKED: "user_blocked",
  USER_UNBLOCKED: "user_unblocked",
  MESSAGES_UNSENT: "message_unsent",
  CHAT_CLEARED: "chat_cleared",
  CHAT_DELTED: "chat_deleted",
  ARCHIVED: "archived",
  CHAT_MUTED: "chat_muted",
} as const;

export type DirectSystemEventType =
  (typeof DirectSystemEventType)[keyof typeof DirectSystemEventType];

export const GroupSystemEventType = {
  USER_ADDED: "user_added",
  USER_REMOVED: "user_removed",
  USER_LEFT: "user_left",
  GROUP_RENAMED: "group_renamed",
  GROUP_CREATED: "group_created",
  ADMIN_ASSIGNED: "admin_assigned",
  ADIM_REMOVED: "admin_removed",
  GROUP_ICON_CHANGED: "group_icon_changed",
  GROUP_DESCRIPTION_UPDATED: "group_description_updated",
  MESSAGE_PINNED: "message_pinned",
} as const;

export type GroupSystemEventType =
  (typeof GroupSystemEventType)[keyof typeof GroupSystemEventType];
