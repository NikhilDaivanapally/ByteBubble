const Settings = () => {
  return (
    <div className="h-full flex">
      <div
        className={`flex flex-col gap-4 px-4 flex-1 md:flex-none min-w-[340px] md:w-[370px]
        md:h-full overflow-y-hidden `}
      >
        <h1 className="text-2xl font-semibold py-2">Settings</h1>
      </div>
      <div>
        <h1 className="text-2xl font-semibold py-2">Profile</h1>
      </div>
    </div>
  );
};

export default Settings;
