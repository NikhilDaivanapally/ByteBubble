import { Icons } from "../icons";
import ReadIndicator from "./ui/ReadIndicator";

export const MessageStatus = ({
  isIncoming,
  status,
  isRead,
  seen,
  time,
}: {
  isIncoming: boolean;
  status: string | "sent" | "pending";
  isRead?: boolean;
  seen?: boolean;
  time: string;
}) => {
  if (isIncoming) {
    return <p className="text-xs text-black/60">{time}</p>;
  }

  return (
    <footer className="w-fit ml-auto flex gap-2">
      {/* Message status indicator */}
      {status === "pending" ? (
        <Icons.ClockIcon />
      ) : (
        <ReadIndicator read={(isRead || seen) as boolean} />
      )}
      <time dateTime={time} className="text-xs text-black/60">
        {time}
      </time>
    </footer>
  );
};
