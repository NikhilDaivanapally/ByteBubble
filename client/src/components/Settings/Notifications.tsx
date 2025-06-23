import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { clearActiveSettingPage } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { motion } from "motion/react";
const Notifications = () => {
  const dispatch = useDispatch();
  const handleClearActiveSettingsPage = useCallback(() => {
    dispatch(clearActiveSettingPage());
  }, []);

  const settings = [
    {
      title: "Messages",
      items: [
        {
          label: "Message notifications",
          description: "Get notified when someone sends you a message",
        },
        {
          label: "In-app sounds",
          description: "Play a sound when you receive a message",
        },
      ],
    },
    {
      title: "Group chats",
      items: [
        {
          label: "Group chat notifications",
          description:
            "Get notified when someone sends a message in a group chat",
        },
        {
          label: "In-app sounds",
          description:
            "Play a sound when you receive a message in a group chat",
        },
      ],
    },
    {
      title: "Other alerts",
      items: [
        {
          label: "Reactions",
          description: "Get notified when someone reacts to your messages",
        },
        {
          label: "Mentions",
          description: "Get notified when someone mentions you in a chat",
        },
        {
          label: "Group chat events",
          description: "Get notified when someone joins or leaves a group chat",
        },
        {
          label: "App updates",
          description: "Get notified about new features and updates",
        },
      ],
    },
  ];

  const [toggles, setToggles] = useState<Record<string, boolean>>({});

  const toggle = (label: string) => {
    setToggles((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">Notifications</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-0 md:p-4 overflow-y-auto">
        {settings.map((section) => (
          <div key={section.title}>
            <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-2">
              {section.title}
            </h3>
            {section.items.map((item, idx) => {
              const isChecked = toggles[item.label] ?? false;
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
                        onChange={() => toggle(item.label)}
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
                    {/* <label
                      className={`relative  inline-flex items-center cursor-pointer w-[51px] h-[31px]`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(item.label)}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-full h-full rounded-full transition-colors duration-300 ${
                          isChecked ? "bg-[#dce8f3]" : "bg-[#f1f2f4]"
                        }`}
                      />
                      <motion.div
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        className="absolute left-0 top-0 h-[31px] w-[27px] rounded-full bg-white shadow-md peer-checked:left-[calc(100%-27px)]"
                      />
                    </label> */}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </main>
    </div>
  );
};

export default Notifications;
