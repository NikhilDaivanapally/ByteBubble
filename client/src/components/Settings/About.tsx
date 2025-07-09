import { useCallback } from "react";
import { clearActiveSettingPath } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { useDispatch } from "react-redux";

const About = () => {
  const dispatch = useDispatch();

  const handleClearActiveSettingsPage = useCallback(() => {
    dispatch(clearActiveSettingPath());
  }, []);

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">About</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
        {/* About ByteBubble */}
        <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2">
          <div className="flex flex-col justify-center">
            <p className="text-[#121416] text-base font-medium leading-normal">
              About ByteBubble
            </p>
            <p className="text-[#6a7681] text-sm font-normal leading-normal line-clamp-3">
              ByteBubble is a modern, secure and real-time messaging platform built
              to connect people across the world. Whether you're chatting with
              friends, managing communities, or collaborating at work, ByteBubble
              provides a clean and efficient interface.
            </p>
          </div>
        </div>

        {/* Vision or Features */}
        <div className="flex items-center gap-4 bg-white px-4 min-h-14 justify-between">
          <p className="text-[#121416] text-base font-normal leading-normal flex-1 truncate">
            Learn more about our mission and features
          </p>
          <div className="shrink-0">
            <div className="text-[#121416] flex size-7 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
              </svg>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
