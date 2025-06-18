import { useDispatch } from "react-redux";
import { AdaptiveDropdown } from "../AdaptiveDropdown";
// import { Icons } from "../../../icons";
// import { setMessageInfo } from "../../../store/slices/appSlice";
import { useMemo } from "react";
import { Icons } from "../../../../icons";
import { direct } from "../../../../utils/conversation-types";
import { setMessageInfo } from "../../../../store/slices/appSlice";
// import { individual } from "../../../utils/conversation-types";

export const MessageActions = ({ message }: { message: any }) => {
  const dispatch = useDispatch();

  const BaseActions = [
    {
      name: "Reply",
      icon: <Icons.ArrowUturnLeftIcon className="w-4" />,
      action: () => console.log("Reply"),
    },
    {
      name: "Copy",
      icon: <Icons.ClipboardIcon className="w-4" />,
      action: () => navigator.clipboard.writeText(message.text),
    },

    {
      name: "Delete",
      icon: <Icons.DeleteIcon className="w-4 text-red-600" />,
      className: "text-red-600",
      action: () => console.log("Delete"),
    },
  ];

  const actions = useMemo(() => {
    return message?.conversationType == direct
      ? BaseActions
      : [
          {
            name: "Message Info",
            icon: <Icons.InformationCircleIcon className="w-4" />,
            action: () => dispatch(setMessageInfo(message)),
          },
          ...BaseActions,
        ];
  }, [message]);

  return (
    <AdaptiveDropdown actions={actions} className="">
      <Icons.ChevronDownIcon className="w-5 hover:text-gray-600" />
    </AdaptiveDropdown>
  );
};
