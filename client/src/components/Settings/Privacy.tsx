import { useState } from "react";
import { useDispatch } from "react-redux";
import { clearActiveSettingPage } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { SETTINGS_CONFIG } from "../../constants/settings-config";
import { motion } from "motion/react";
const PRIVACY_OPTIONS = ["Everyone", "My Contacts", "Nobody"];

const Privacy = () => {
  const dispatch = useDispatch();

  const handleClearActiveSettingsPage = () => {
    dispatch(clearActiveSettingPage());
  };

  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [selectValues, setSelectValues] = useState<Record<string, string>>({
    profilePhotoVisibleTo: "Everyone",
    AboutVisibleTo: "Everyone",
    lastSeenVisibleTo: "Everyone",
    groupsAddPermission: "Everyone",
  });

  const handleToggleReadReceipts = () => {
    setReadReceiptsEnabled((prev) => !prev);
  };

  const handleSelectChange = (key: string, value: string) => {
    setSelectValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderSelectItem = (itemKey: string, item: any) => (
    <div
      key={itemKey}
      className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between"
    >
      <div className="flex flex-col justify-center">
        <p className="text-[#121416] text-base font-medium leading-normal">
          {item.label}
        </p>
        <p className="text-sm text-gray-500">{selectValues[itemKey]}</p>
      </div>
      <select
        value={selectValues[itemKey]}
        onChange={(e) => handleSelectChange(itemKey, e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-700 bg-white"
      >
        {PRIVACY_OPTIONS.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );

  const renderToggleItem = (item: any) => (
    <div
      key={item.label}
      className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between"
    >
      <div className="flex flex-col justify-center">
        <p className="text-[#121416] text-base font-medium leading-normal">
          {item.label}
        </p>
        <p className="text-[#6a7681] text-sm font-normal leading-normal">
          {readReceiptsEnabled
            ? "If turned off, you won't be able to see other people's read receipts."
            : "You won't see or send read receipts."}
        </p>
      </div>
      <div className="shrink-0">
        <label
          className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full p-0.5 transition-colors duration-300 ${
            readReceiptsEnabled ? "bg-btn-primary/50" : "bg-[#f1f2f4]"
          }`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={readReceiptsEnabled}
            onChange={handleToggleReadReceipts}
          />
          <motion.div
            className="h-[27px] w-[27px] rounded-full bg-white absolute top-0.5 left-0.5"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px",
            }}
            animate={{ x: readReceiptsEnabled ? 20 : 0 }}
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

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <>
      <h3 className="text-[#121416] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        {title}
      </h3>
      {children}
    </>
  );

  const { profileInfo, messages, groups } = SETTINGS_CONFIG.privacy;

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">Privacy</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col py-10 px-4 overflow-y-auto">
        <Section title="Profile Information">
          {Object.entries(profileInfo).map(([key, item]) =>
            renderSelectItem(key, item)
          )}
        </Section>

        <Section title="Messages">
          {messages.readReceipts && renderToggleItem(messages.readReceipts)}
        </Section>

        <Section title="Groups">
          {Object.entries(groups).map(([key, item]) =>
            renderSelectItem(key, item)
          )}
        </Section>
      </main>
    </div>
  );
};

export default Privacy;
