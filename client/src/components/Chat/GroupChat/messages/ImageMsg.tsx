import { GroupMessageProps } from "../../../../types";
import { useDispatch } from "react-redux";
import { setfullImagePreview } from "../../../../store/slices/conversation";
import { Icons } from "../../../../icons";
import Loader from "../../../ui/Loader";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { MessageActions } from "../../../ui/Dropdowns/actions/MessageActions";

export const GroupImageMsg = ({
  el,
  usersLength,
  scrollToBottom,
}: {
  el: GroupMessageProps;
  usersLength: number;

  scrollToBottom: () => void;
}) => {
  const dispatch = useDispatch();
  const time = formatTo12HourTime(el?.createdAt);
  const readUsers = el.readBy?.length ?? 0;
  const seen = usersLength > 0 && readUsers >= usersLength;
  return (
    <div
      className={`Media_msg relative w-fit flex group items-start  ${
        !el.isIncoming ? "ml-auto" : ""
      }`}
    >
      {!el.isIncoming && <MessageActions message={el} />}

      {el.isIncoming && (
        <div className="user_profile mr-2 w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={el.from?.avatar}
            alt=""
          />
        </div>
      )}
      <div className={`p-1 rounded-xl space-y-1`}>
        <div
          className={`Media_Container p-1 relative border-1 shadow rounded-lg ${
            !el.isIncoming
              ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
              : "bg-white rounded-bl-none border-gray-200"
          }`}
        >
          {el.isIncoming && (
            <p className="userName text-black/60 text-sm">
              {el.from?.userName}
            </p>
          )}

          <div
            className="cursor-pointer"
            onClick={() => dispatch(setfullImagePreview({ fullviewImg: el }))}
          >
            <img
              className="h-40 w-auto rounded-lg"
              src={el?.message?.imageUrl}
              alt=""
              onLoad={scrollToBottom}
              style={{ userSelect: "none" }}
            />
            {el.status === "pending" && (
              <div className="absolute inset-0 flex-center">
                <Loader />
              </div>
            )}
          </div>
          {el?.message?.description && (
            <p className="text-sm px-2 py-1">{el?.message?.description}</p>
          )}
        </div>
        <div className="w-fit ml-auto flex gap-2">
          {!el?.isIncoming &&
            (el?.status === "pending" ? (
              <Icons.ClockIcon />
            ) : (
              <div className="flex-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    seen ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`w-2 h-2 rounded-full ${
                    seen ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              </div>
            ))}
          <p className="text-xs text-black/60">{time}</p>
        </div>
      </div>
    </div>
  );
};
