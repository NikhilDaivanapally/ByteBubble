import { DirectMessageProps } from "../../../../types";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { MessageStatus } from "../../../MessageStatus";
import { MessageActions } from "../../../ui/Dropdowns/actions/MessageActions";

export const DirectTextMsg = ({ el }: { el: DirectMessageProps }) => {
  const time = formatTo12HourTime(el.createdAt);

  return (
    <div
      className={`Text_msg relative w-fit flex group items-start ${
        !el.isIncoming ? "ml-auto" : ""
      }`}
    >
      {!el.isIncoming && <MessageActions message={el} />}
      <div className="space-y-1">
        <div
          className={`px-2 py-1 rounded-xl ${
            !el.isIncoming
              ? "bg-gray-300 rounded-br-none"
              : "bg-white rounded-bl-none"
          }`}
        >
          <p>{el.message?.text}</p>
        </div>
        <MessageStatus
          isIncoming={el.isIncoming}
          status={el.status}
          isRead={el.isRead}
          time={time}
        />
      </div>
    </div>
  );
};
