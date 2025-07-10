import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { MessageStatus } from "../../../MessageStatus";
import { GroupMessageProps } from "../../../../types";
import { GroupMessageActions } from "../../../ui/Dropdowns/actions/GroupMessageActions";
import { Avatar } from "../../../ui/Avatar";

export const GroupTextMsg = ({
  el,
  groupName,
  usersLength,
}: {
  el: GroupMessageProps;
  groupName: string;
  usersLength: number;
}) => {
  const readUsers = el.readBy?.length ?? 0;
  const seen = usersLength > 0 && readUsers >= usersLength;
  const isOutgoing = !el?.isIncoming;
  const time = formatTo12HourTime(el.createdAt);
  return (
    <div
      className={`Text_msg relative w-fit max-w-[90%] sm:max-w-[80%] lg:max-w-[60%] flex group items-start ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <GroupMessageActions message={el} />}
            {el.isIncoming && <Avatar size="sm" url={el.from.avatar} />}

      <section
        className="space-y-1"
        aria-label={`Message in ${groupName} from ${el.from?.userName} at ${time}`}
      >
        {/* Header & Message content */}
        <div
          className={`px-2 py-1 rounded-xl ${
            isOutgoing
              ? "bg-gray-300 rounded-br-none"
              : "bg-white rounded-bl-none"
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
          <p className="tracking-normal">{el.message?.text}</p>
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
