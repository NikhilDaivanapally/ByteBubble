import { DirectMessageProps } from "../../../../types";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { MessageStatus } from "../../../MessageStatus";
import { DirectMessageActions } from "../../../ui/Dropdowns/actions/DirectMessageActions";

export const DirectTextMsg = ({
  el,
  from,
}: {
  el: DirectMessageProps;
  from: string;
}) => {
  const isOutgoing = !el?.isIncoming;
  const time = formatTo12HourTime(el.createdAt);
  return (
    <div
      className={`Text_msg relative w-fit flex group items-start ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <DirectMessageActions message={el} />}
      <section
        aria-label={`Message from ${from} at ${time}`}
        className="space-y-1"
      >
        {/* Message content */}
        <div
          className={`px-2 py-1 rounded-xl ${
            !el.isIncoming
              ? "bg-gray-300 rounded-br-none"
              : "bg-white rounded-bl-none"
          }`}
        >
          <p>{el.message?.text}</p>
        </div>

        {/* footer */}
        <MessageStatus
          isIncoming={el.isIncoming}
          status={el.status}
          isRead={el.isRead}
          time={time}
        />
      </section>
    </div>
  );
};
