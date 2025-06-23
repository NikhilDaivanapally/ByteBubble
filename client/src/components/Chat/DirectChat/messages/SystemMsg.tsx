import { useSelector } from "react-redux";
import { DirectMessageProps } from "../../../../types";
import { RootState } from "../../../../store/store";
import { DirectSystemEventType } from "../../../../constants/system-event-types";
import { generateDirectSystemMessage } from "../../../../utils/generate-direct-systemMsg";

export const DirectSystemMsg = ({ el }: { el: DirectMessageProps }) => {
  const auth = useSelector((state: RootState) => state.auth.user);
  const currentConversation = useSelector(
    (state: RootState) =>
      state.conversation.direct_chat.current_direct_conversation
  );
  const systemMsg = generateDirectSystemMessage({
    eventType: el.systemEventType as DirectSystemEventType,
    from: el.metadata,
    to: el.eventUserSnapshot,
    currentUserId: auth?._id,
    currentConversation,
  });

  return (
    <div className="w-full relative flex-center text-center ">
      <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
        {systemMsg}
      </p>
    </div>
  );
};
