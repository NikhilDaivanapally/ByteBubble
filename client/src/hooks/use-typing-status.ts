// example with React and TypeScript
import { useRef } from "react";
import { Socket } from "socket.io-client";

function useTypingStatus(
  socket: Socket,
  roomId: string | null,
  user: any,
  chatType: string | null,
  currentConversation: string | any[] | undefined
) {
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  const handleTyping = () => {
    if (!isTyping.current) {
      isTyping.current = true;
      socket.emit("typing:start", { roomId, user, chatType, currentConversation });
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      isTyping.current = false;
      socket.emit("typing:stop", {
        roomId,
        user,
        chatType,
        currentConversation,
      });
    }, 2000); // 2s of inactivity
  };

  return { handleTyping };
}

export default useTypingStatus;
