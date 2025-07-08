import { useCallback } from "react";
import { clearActiveSettingPath } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { useDispatch } from "react-redux";

const Help = () => {
  const dispatch = useDispatch();

  const handleClearActiveSettingsPage = useCallback(() => {
    dispatch(clearActiveSettingPath());
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-2 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">Help</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col  md:py-5 md:px-4 overflow-y-auto">
        <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Frequently Asked Questions
        </h2>

        <div className="flex flex-col p-4">
          {[
            "How do I change my profile picture?",
            "How do I block a user?",
            "How do I report a user?",
          ].map((question, index) => (
            <details
              key={index}
              className="flex flex-col border-t border-t-[#dde1e3] py-2 group"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
                <p className="text-[#121416] text-sm font-medium leading-normal">
                  {question}
                </p>
                <div className="text-[#121416] group-open:rotate-180">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                  >
                    <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z" />
                  </svg>
                </div>
              </summary>
              <p className="text-[#6a7681] text-sm font-normal leading-normal pb-2">
                {/* Add your answer here if needed */}
              </p>
            </details>
          ))}
        </div>

        <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Contact Support
        </h2>
        <p className="text-[#121416] text-base font-normal leading-normal pb-3 pt-1 px-4">
          If you have any other questions or need further assistance, please
          contact our support team.
        </p>
        <div className="flex px-4 py-3 justify-start">
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#dce8f3] text-[#121416] text-sm font-bold leading-normal tracking-[0.015em]">
            <span className="truncate">Contact Support</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Help;
