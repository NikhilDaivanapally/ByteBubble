import { Icons } from "../../icons";

const Setting = () => {
  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      <div className="flex flex-col gap-4 items-center justify-center h-full">
        <Icons.Cog6ToothIcon className="w-20 text-gray-400/50" />
        <h1 className="text-4xl font-semibold text-black/60">Settings</h1>
      </div>
    </div>
  );
};

export default Setting;
