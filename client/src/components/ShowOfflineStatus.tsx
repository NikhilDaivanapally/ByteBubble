import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useState } from "react";
import { Icons } from "../icons";

const ShowOfflineStatus = () => {
  const { onlineStatus } = useSelector((state: RootState) => state.app);
  const [showDialog, setShowDialog] = useState(true);
  return (
    <>
      {!onlineStatus && showDialog ? (
        <div className="flex gap-4 p-2 bg-gray-100 whitespace-nowrap rounded-lg">
          <Icons.SignalSlashIcon className="w-6 fill-orange-400" />
          <div>
            <p>Device is Offline</p>
            <span className="text-black/60 text-sm">
              Make sure you have active internet
            </span>
          </div>
          <Icons.XMarkIcon
            onClick={() => setShowDialog((prev) => !prev)}
            className="w-4 cursor-pointer self-start ml-auto"
          />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default ShowOfflineStatus;
