import { useDispatch } from "react-redux";
import { Icons } from "../../icons";
import { clearActiveSettingPage } from "../../store/slices/settingsSlice";
import { useState } from "react";

const Privacy = () => {
  const dispatch = useDispatch();
  const handleClearActiveSettingsPage = () => {
    dispatch(clearActiveSettingPage());
  };
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);

  const handleToggleReadReceipts = () => {
    setReadReceiptsEnabled((prev) => !prev);
  };

  const settings = {
    profileInfo: [
      { label: "Profile Photo", value: "Everyone" },
      { label: "About", value: "Everyone" },
    ],
    messages: [
      {
        label: "Last Seen",
        value: "Everyone",
      },
      {
        label: "Read Receipts",
        value: readReceiptsEnabled
          ? "If turned off, you won't be able to see other people's read receipts."
          : "You won't see or send read receipts.",
        isToggle: true,
      },
    ],
    groups: [{ label: "Add me to groups", value: "Everyone" }],
    blockedContacts: [{ label: "Blocked Contacts", value: "0" }],
    // disappearing: [{ label: "Default message timer", value: "Off" }],
  };

  const renderSettingItem = (item: any, key: number) => (
    <div
      key={key}
      className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between"
    >
      <div className="flex flex-col justify-center">
        <p className="text-[#121416] text-base font-medium leading-normal line-clamp-1">
          {item.label}
        </p>
        {!item.isToggle && (
          <p className="text-[#6a7681] text-sm font-normal leading-normal line-clamp-2">
            {item.value}
          </p>
        )}
        {item.isToggle && (
          <p className="text-[#6a7681] text-sm font-normal leading-normal line-clamp-2">
            {item.value}
          </p>
        )}
      </div>
      {!item.isToggle ? (
        <div className="shrink-0">
          <p className="text-[#121416] text-base font-normal leading-normal">
            {item.label === "Blocked Contacts" ? item.value : "Everyone"}
          </p>
        </div>
      ) : (
        <label
          className={`relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none ${
            readReceiptsEnabled
              ? "bg-[#dce8f3] justify-end"
              : "bg-[#f1f2f4] justify-start"
          } p-0.5`}
          onClick={handleToggleReadReceipts}
        >
          <div
            className="h-full w-[27px] rounded-full bg-white"
            style={{
              boxShadow:
                "rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px",
            }}
          ></div>
          <input
            type="checkbox"
            className="invisible absolute"
            checked={readReceiptsEnabled}
            readOnly
          />
        </label>
      )}
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
  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">privacy</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-0 md:p-4 overflow-y-auto">
        <Section title="Profile Information">
          {settings.profileInfo.map(renderSettingItem)}
        </Section>

        <Section title="Messages">
          {settings.messages.map(renderSettingItem)}
        </Section>

        <Section title="Groups">
          {settings.groups.map(renderSettingItem)}
        </Section>

        <Section title="Blocked Contacts">
          {settings.blockedContacts.map(renderSettingItem)}
        </Section>

        {/* <Section title="Disappearing Messages">
          {settings.disappearing.map(renderSettingItem)}
        </Section> */}
      </main>
    </div>
  );
};

export default Privacy;
