import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { Icons } from "../../../../icons";
import { setGroupMessageInfo } from "../../../../store/slices/appSlice";
import { AdaptiveDropdown } from "../AdaptiveDropdown";

export const GroupMessageActions = ({ message }: { message: any }) => {
  const dispatch = useDispatch();

  const actions = useMemo(() => {
    return [
      {
        name: "Message Info",
        icon: <Icons.InformationCircleIcon className="w-4" />,
        className: "",
        action: () => dispatch(setGroupMessageInfo(message)),
      },
      {
        name: "Reply",
        icon: <Icons.ArrowUturnLeftIcon className="w-4" />,
        className: "",
        action: () => console.log("Reply"),
      },
      {
        name: "Copy",
        icon: <Icons.ClipboardIcon className="w-4" />,
        className: "",
        action: () => navigator.clipboard.writeText(message.text),
      },
      {
        name: "Delete",
        icon: <Icons.DeleteIcon className="w-4 text-red-600" />,
        className: "text-red-600",
        action: () => console.log("Delete"),
      },
    ];
  }, [message]);

  return (
    <AdaptiveDropdown actions={actions} className="">
      <Icons.ChevronDownIcon className="w-5 hover:text-gray-600" />
    </AdaptiveDropdown>
  );
};
