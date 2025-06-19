import { useSelector } from "react-redux";
import { GroupMessageProps, GroupSystemEventType } from "../../../../types";
import { RootState } from "../../../../store/store";

type User = { _id: string; userName: string };

export const generateSystemMessage = ({
  eventType,
  from,
  to,
  currentUserId,
}: {
  eventType: GroupSystemEventType;
  from: User | null;
  to: User | null;
  currentUserId: string;
}): string => {
  const fromName = from?._id === currentUserId ? "You" : from?.userName;
  const toName = to?._id === currentUserId ? "you" : to?.userName;

  switch (eventType) {
    case "user_added":
      return `${fromName} added ${toName}`;
    case "user_removed":
      return `${fromName} removed ${toName}`;
    case "user_left":
      return `${fromName} left the group`;
    case "group_renamed":
      return `${fromName} renamed the group to "${toName}"`; // 'to' can be the new name
    case "group_created":
      return `${fromName} created the group`;
    default:
      return "System notification";
  }
};

export const GroupSystemMsg = ({ el }: { el: GroupMessageProps }) => {
  const auth = useSelector((state: RootState) => state.auth.user);
  const systemMsg = generateSystemMessage({
    eventType: el.systemEventType as GroupSystemEventType,
    from: el?.from,
    to: el?.eventUserSnapshot,
    currentUserId: auth?._id!,
  });

  return (
    <div className="w-full relative flex-center text-center ">
      <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
        {systemMsg}
      </p>
    </div>
  );
};
