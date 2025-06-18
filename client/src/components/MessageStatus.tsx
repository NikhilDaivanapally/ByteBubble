import { Icons } from "../icons";

// components/MessageStatus.tsx
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
    <div className="w-fit ml-auto flex gap-2">
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
      <p className="text-xs text-black/60">{time}</p>
    </div>
  );
};
