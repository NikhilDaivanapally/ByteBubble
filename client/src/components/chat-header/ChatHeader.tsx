import { useDispatch, useSelector } from "react-redux";
import { Icons } from "../../icons";
import { RootState } from "../../store/store";
import {
  ResetDirectChat,
  ResetGroupChat,
} from "../../store/slices/conversation";
import { selectConversation } from "../../store/slices/appSlice";
import { useEffect, useState } from "react";
import { socket } from "../../socket";

const ChatHeader = ({ handleOpenShowDetails = () => {} }) => {
  const dispatch = useDispatch();
  const [istyping, setIstyping] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);
  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );
  const isIndividual = chatType === "individual";
  const isGroup = chatType === "group";
  const imageSrc = isIndividual
    ? direct_chat?.current_direct_conversation?.avatar
    : isGroup
    ? group_chat?.current_group_conversation?.groupImage
    : null;

  const FallbackIcon = isIndividual ? Icons.UserIcon : Icons.UsersIcon;

  const handleGoBack = () => {
    dispatch(selectConversation(null));
    switch (true) {
      case isGroup:
        dispatch(ResetGroupChat());
        break;

      default:
        dispatch(ResetDirectChat());
        break;
    }
  };

  useEffect(() => {
    socket.on("userTyping", (data: { userName: string }) => {
      const { userName } = data;
      setIstyping(userName);
    });
    socket.on("userStoppedTyping", () => {
      setIstyping("");
    });

    return () => {
      socket.off("userTyping");
      socket.off("userStoppedTyping");
    };
  }, [socket]);
  return (
    <nav className="h-15 w-full flex gap-4 items-center p-2 bg-white rounded-xl">
      <Icons.ArrowLeftIcon
        className="w-8 p-1 md:hidden hover:bg-gray-200 rounded-full cursor-pointer"
        onClick={handleGoBack}
      />

      <div
        className="flex gap-4 items-center cursor-pointer select-none active:bg-gray-100 px-2 rounded-lg"
        onClick={handleOpenShowDetails}
      >
        <div className="w-10 h-10 relative flex-center shrink-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              className="w-full h-full rounded-full object-cover"
              alt=""
            />
          ) : (
            <FallbackIcon className="w-8" />
          )}
          {direct_chat?.current_direct_conversation?.online && (
            <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full" />
          )}
        </div>

        {isIndividual ? (
          <div>
            <p className="text-base font-medium text-gray-900">
              {direct_chat?.current_direct_conversation?.name}
            </p>
            {istyping ? (
              <p className="text-sm text-green-500">Typing ...</p>
            ) : (
              <p className="text-sm text-gray-500">
                {direct_chat?.current_direct_conversation?.online
                  ? "Online"
                  : "Offline"}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-base font-medium text-gray-900">
              {group_chat?.current_group_conversation?.groupName}
            </p>
            {istyping ? (
              <p className="text-sm text-green-500">{istyping} is typing</p>
            ) : (
              <p className="text-sm text-gray-500">
                {[
                  ...group_chat?.current_group_conversation?.users,
                  group_chat?.current_group_conversation?.admin,
                ]
                  .map((el, i, arr) => {
                    const name = el?._id === user?._id ? "you" : el?.userName;
                    return `${name}${i < arr.length - 1 ? ", " : ""}`;
                  })
                  .join("")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto mr-2 md:mr-8 flex gap-6 md:gap-10 items-center">
        <Icons.PhoneIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
        <Icons.VideoCameraIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
        <Icons.EllipsisVerticalIcon className="w-7 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
      </div>
    </nav>
  );
};

export default ChatHeader;
