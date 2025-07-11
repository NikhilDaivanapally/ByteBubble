import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Avatar } from "../../ui/Avatar";
import { Icons } from "../../../icons";
import { ResetDirectChat } from "../../../store/slices/conversation";
import { selectConversation } from "../../../store/slices/appSlice";

const DirectChatHeader = ({ handleOpenShowDetails = () => {} }) => {
  const dispatch = useDispatch();
  const { isTyping } = useSelector((state: RootState) => state.app);
  const { current_direct_conversation } = useSelector(
    (state: RootState) => state.conversation.direct_chat
  );

  const handleGoBack = () => {
    dispatch(selectConversation(null));
    dispatch(ResetDirectChat());
  };

  return (
    <header className="h-15 w-full flex sm:gap-4 items-center p-2 bg-white rounded-xl">
      <Icons.ArrowLeftIcon
        className="w-8 p-1 md:hidden hover:bg-gray-200 rounded-full cursor-pointer"
        onClick={handleGoBack}
      />

      <div
        className="flex gap-4 items-center cursor-pointer px-2 rounded-lg min-w-0"
        onClick={handleOpenShowDetails}
      >
        <Avatar
          size="md"
          url={current_direct_conversation?.avatar}
          fallBackType="direct"
          online={current_direct_conversation?.isOnline}
        />
        <div className="min-w-0">
          <p className="text-base font-medium text-gray-900 truncate">
            {current_direct_conversation?.name}
          </p>
          {isTyping ? (
            <p className="text-sm text-green-500 truncate">Typing...</p>
          ) : (
            <p className="text-sm text-gray-500 truncate">
              {current_direct_conversation?.isOnline ? "Online" : "Offline"}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto mr-2 md:mr-8 flex gap-2 sm:gap-10 items-center">
        {/* <Icons.PhoneIcon className="w-8 p-1 rounded-full hover:bg-gray-200 cursor-pointer" />
        <Icons.VideoCameraIcon className="w-8 p-1 rounded-full hover:bg-gray-200 cursor-pointer" /> */}
        <Icons.EllipsisVerticalIcon
          className="w-7 p-1 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={handleOpenShowDetails}
        />
      </div>
    </header>
  );
};

export default DirectChatHeader;
