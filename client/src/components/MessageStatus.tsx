import { Icons } from "../icons";

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
        <div className="flex-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              isRead || seen ? "bg-green-600" : "bg-gray-300"
            }`}
          />
          <div
            className={`w-2 h-2 rounded-full ${
              isRead || seen ? "bg-green-600" : "bg-gray-300"
            }`}
          />
        </div>
      )}
      <time dateTime={time} className="text-xs text-black/60">
        {time}
      </time>
    </footer>
  );
};
