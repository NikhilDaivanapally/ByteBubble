import { GroupMessageProps } from "../../../../types";
import { useDispatch } from "react-redux";
import { setfullImagePreview } from "../../../../store/slices/conversation";
import Loader from "../../../ui/Loader";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { GroupMessageActions } from "../../../ui/Dropdowns/actions/GroupMessageActions";
import { MessageStatus } from "../../../MessageStatus";

export const GroupImageMsg = ({
  el,
  groupName,
  usersLength,
  scrollToBottom,
}: {
  el: GroupMessageProps;
  groupName: string;
  usersLength: number;

  scrollToBottom: () => void;
}) => {
  const dispatch = useDispatch();
  const isOutgoing = !el?.isIncoming;
  const time = formatTo12HourTime(el?.createdAt);
  const readUsers = el.readBy?.length ?? 0;
  const seen = usersLength > 0 && readUsers >= usersLength;
  return (
    <div
      className={`Media_msg relative w-fit flex group items-start  ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <GroupMessageActions message={el} />}

      {el.isIncoming && (
        <div className="user_profile mr-2 w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={el.from?.avatar}
            alt=""
          />
        </div>
      )}

      <section
        className={`p-1 rounded-xl space-y-1`}
        aria-label={`Message in ${groupName} from ${el.from?.userName} at ${time}`}
      >
        {/* Header & Message content */}
        <div
          className={`Media_Container p-1 relative border-1 shadow rounded-lg ${
            isOutgoing
              ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
              : "bg-white rounded-bl-none border-gray-200"
          }`}
        >
          {/* header */}
          <header>
            {el.isIncoming && (
              <p className="userName text-black/60 text-sm">
                {el.from?.userName}
              </p>
            )}
          </header>

          {/* Message content */}
          <figure>
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
            <figcaption>
              {el?.message?.description && (
                <p className="text-sm px-2 py-1">{el?.message?.description}</p>
              )}
            </figcaption>
          </figure>
        </div>

        {/* footer */}
        <MessageStatus
          isIncoming={el.isIncoming}
          status={el.status}
          seen={seen}
          time={time}
        />
      </section>
    </div>
  );
};
