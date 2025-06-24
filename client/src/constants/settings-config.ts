// constants/settingsConfig.ts
export const SETTINGS_CONFIG = {
  notifications: {
    messages: {
      messageNotifications: {
        label: "Message notifications",
        description: "Get notified when someone sends you a message",
      },
      inAppSounds: {
        label: "In-app sounds",
        description: "Play a sound when you receive a message",
      },
    },
    groupChats: {
      groupChatNotifications: {
        label: "Group chat notifications",
        description:
          "Get notified when someone sends a message in a group chat",
      },
      inAppSounds: {
        label: "In-app sounds",
        description: "Play a sound when you receive a message in a group chat",
      },
    },
  },
  privacy: {
    profileInfo: {
      profilePhotoVisibleTo: { label: "Profile Photo", value: "Everyone" },
      AboutVisibleTo: { label: "About", value: "Everyone" },
      lastSeenVisibleTo: { label: "Last Seen", value: "Everyone" },
    },
    messages: {
      readReceipts: {
        label: "Read Receipts",
        value: false
          ? "If turned off, you won't be able to see other people's read receipts."
          : "You won't see or send read receipts.",
        isToggle: true,
      },
    },
    groups: {
      groupsAddPermission: {
        label: "Add me to groups",
        value: "Everyone",
      },
    },
  },
};
