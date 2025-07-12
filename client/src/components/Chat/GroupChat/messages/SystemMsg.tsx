import { useSelector } from "react-redux";
import { GroupMessageProps, GroupSystemEventType } from "../../../../types";
import { RootState } from "../../../../store/store";
import { generateGroupSystemMessage } from "../../../../utils/generate-group-systemMsg";

export const GroupSystemMsg = ({ el }: { el: GroupMessageProps }) => {
  const auth = useSelector((state: RootState) => state.auth.user);
  const systemMsg = generateGroupSystemMessage({
    eventType: el.systemEventType as GroupSystemEventType,
    from: el?.from,
    to: el?.eventUserSnapshot,
    currentUserId: auth?._id!,
  });

  return (
    <div className="w-full relative flex-center text-center ">{systemMsg}</div>
  );
};
