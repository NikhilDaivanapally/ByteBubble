import { useCallback } from "react";
import { clearActiveSettingPage } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { useDispatch } from "react-redux";

const AccountSettings = () => {
  const dispatch = useDispatch();

  const handleClearActiveSettingsPage = useCallback(() => {
    dispatch(clearActiveSettingPage());
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">
          Account settings
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto"></main>
    </div>
  );
};

export default AccountSettings;
