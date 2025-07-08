import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearActiveSettingPath,
  SettingsState,
  updateSettingField,
} from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { motion } from "motion/react";
import { SETTINGS_CONFIG } from "../../constants/settings-config";
import { RootState } from "../../store/store";

const Notifications = () => {
  const notificationSections = SETTINGS_CONFIG.notifications;
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings.data);

  const handleClearActiveSettingsPage = useCallback(() => {
    dispatch(clearActiveSettingPath());
  }, [dispatch]);

  const handleToggle = async (path: string) => {
    const keys = path.split(".");
    const currentValue = keys.reduce((acc: any, key) => acc[key], settings);
    const newValue = !currentValue;
    dispatch(updateSettingField({ path, value: newValue }));
  };

  type NotificationSectionKey = keyof SettingsState["data"]["notifications"];

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-2 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">Notifications</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:py-5 md:px-4 overflow-y-auto">
        {Object.entries(notificationSections).map(
          ([sectionKey, sectionItems]) => {
            const section = sectionKey as NotificationSectionKey;

            return (
              <div key={section}>
                <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2 capitalize">
                  {section.replace(/([A-Z])/g, " $1")}
                </h3>

                {Object.entries(sectionItems).map(([key, item], idx) => {
                  let isChecked = false;

                  if (section === "messages") {
                    isChecked =
                      key in settings.notifications.messages
                        ? settings.notifications.messages[
                            key as keyof typeof settings.notifications.messages
                          ]
                        : false;
                  } else if (section === "groupChats") {
                    isChecked =
                      key in settings.notifications.groupChats
                        ? settings.notifications.groupChats[
                            key as keyof typeof settings.notifications.groupChats
                          ]
                        : false;
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between"
                    >
                      <div className="flex flex-col justify-center">
                        <p className="text-[#121416] text-base font-medium leading-normal line-clamp-1">
                          {item.label}
                        </p>
                        <p className="text-[#6a7681] text-sm font-normal leading-normal line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <label
                          className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 ${
                            isChecked ? "bg-btn-primary/50" : "bg-[#f1f2f4]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() =>
                              handleToggle(`notifications.${section}.${key}`)
                            }
                          />
                          <motion.div
                            className="h-[27px] w-[27px] rounded-full bg-white absolute top-0.5 left-0.5"
                            style={{
                              boxShadow:
                                "rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px",
                            }}
                            animate={{ x: isChecked ? 20 : 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }
        )}
      </main>
    </div>
  );
};

export default Notifications;
