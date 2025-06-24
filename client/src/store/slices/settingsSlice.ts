import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SettingsState {
  activeSettingPage: null | string;
  data: {
    notifications: {
      messages: {
        messageNotifications: boolean;
        inAppSounds: boolean;
      };
      groupChats: {
        groupChatNotifications: boolean;
        inAppSounds: boolean;
      };
    };
    privacy: {
      readReceipts: boolean;
      lastSeenVisible: boolean;
      profilePhotoVisibleTo: "everyone" | "connections" | "nobody";
      AboutVisibleTo: "everyone" | "connections" | "nobody";
      groupsAddPermission: "everyone" | "connections" | "nobody";
    };
    behavior: {
      enterToSend: boolean;
      autoDownloadMedia: boolean;
    };
  };
}

const initialState: SettingsState = {
  activeSettingPage: null,
  data: {
    notifications: {
      messages: {
        messageNotifications: true,
        inAppSounds: true,
      },
      groupChats: {
        groupChatNotifications: true,
        inAppSounds: true,
      },
    },
    privacy: {
      readReceipts: true,
      lastSeenVisible: true,
      profilePhotoVisibleTo: "everyone",
      AboutVisibleTo: "everyone",
      groupsAddPermission: "everyone",
    },
    behavior: {
      enterToSend: true,
      autoDownloadMedia: false,
    },
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setActiveSettingPage: (state, action: PayloadAction<string | null>) => {
      state.activeSettingPage = action.payload;
    },
    clearActiveSettingPage: (state) => {
      state.activeSettingPage = null;
    },
    setSettings: (state, action: PayloadAction<SettingsState["data"]>) => {
      state.data = action.payload;
    },
    updateSettingField: (
      state,
      action: PayloadAction<{ path: string; value: any }>
    ) => {
      const keys = action.payload.path.split(".");
      let current: any = state.data;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = action.payload.value;
    },
  },
});

export const {
  setActiveSettingPage,
  clearActiveSettingPage,
  setSettings,
  updateSettingField,
} = settingsSlice.actions;

export default settingsSlice.reducer;
