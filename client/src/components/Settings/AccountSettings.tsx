import { useCallback, useEffect, useState } from "react";
import { clearActiveSettingPath } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { useDispatch } from "react-redux";
import { Button } from "../ui/Button";
import { AnimatePresence } from "motion/react";
import UpdatePassword from "./UpdatePassword";
import { useNavigate } from "react-router-dom";

const AccountSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleClearActiveSettingsPage = useCallback(() => {
    navigate("/settings");
  }, [dispatch, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearActiveSettingPath());
    };
  }, []);

  const SettingItem = ({ title, subtitle }: any) => (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
      <div className="flex flex-col justify-center">
        <p className="text-[#111518] text-base font-medium leading-normal line-clamp-1">
          {title}
        </p>
        <p className="text-[#60768a] text-sm font-normal leading-normal line-clamp-2">
          {subtitle}
        </p>
      </div>
      <Button variant="update" size="sm" onClick={() => setIsOpen(true)}>
        Update
      </Button>
    </div>
  );

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      <header className="border-b border-gray-200 px-2 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">
          Account settings
        </h1>
      </header>

      <main className="relative flex-1 flex flex-col md:py-5 md:px-4 overflow-y-auto">
        <h3 className="text-[#111518] text-lg font-bold tracking-[-0.015em] px-4 pb-2 pt-2">
          Password
        </h3>
        <SettingItem title="Update password" subtitle="Change your password" />

        <h3 className="text-[#111518] text-lg font-bold tracking-[-0.015em] px-4 pb-2 pt-4">
          Delete account
        </h3>
        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
          <div className="flex flex-col justify-center">
            <p className="text-[#111518] text-base font-medium leading-normal line-clamp-1">
              Delete account
            </p>
            <p className="text-[#60768a] text-sm font-normal leading-normal line-clamp-2">
              Permanently delete your account
            </p>
          </div>
          <Button variant="danger" size="sm">
            Delete
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && <UpdatePassword onClose={() => setIsOpen(false)} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AccountSettings;
