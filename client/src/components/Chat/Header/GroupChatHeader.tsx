import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Avatar } from "../../ui/Avatar";
import { Icons } from "../../../icons";
import { ResetGroupChat } from "../../../store/slices/conversation";
import { selectConversation } from "../../../store/slices/appSlice";

const GroupChatHeader = ({ handleOpenShowDetails = () => {} }) => {
  const dispatch = useDispatch();
  const { isTyping } = useSelector((state: RootState) => state.app);
  const { user: auth } = useSelector((state: RootState) => state.auth);
  const { current_group_conversation } = useSelector(
    (state: RootState) => state.conversation.group_chat
  );

  const handleGoBack = () => {
    dispatch(selectConversation(null));
    dispatch(ResetGroupChat());
  };

  const participants = [...(current_group_conversation?.users || [])]
    .filter((user) => user?._id !== auth?._id)
    .map((el, i, arr) => {
      const name = el?._id === auth?._id ? "you" : el?.userName;
      return ` ${name}${i < arr.length - 1 ? ", " : ""}`;
    });

  return (
    <nav className="h-15 w-full flex sm:gap-4 items-center p-2 bg-white rounded-xl">
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
          url={current_group_conversation?.avatar}
          fallBackType="group"
        />
        <div className="min-w-0">
          <p className="text-base font-medium text-gray-900 truncate">
            {current_group_conversation?.name}
          </p>
          {isTyping ? (
            <p className="text-sm text-green-500 truncate">
              {isTyping} is typing
            </p>
          ) : (
            <p className="text-sm text-gray-500 truncate">
              you ,{participants.join("")}
            </p>
          )}
        </div>
      </div>

      <div className="ml-auto mr-2 md:mr-8 flex gap-2 sm:gap-10 items-center">
        <Icons.PhoneIcon className="w-8 p-1 rounded-full hover:bg-gray-200 cursor-pointer" />
        <Icons.VideoCameraIcon className="w-8 p-1 rounded-full hover:bg-gray-200 cursor-pointer" />
        <Icons.EllipsisVerticalIcon
          className="w-7 p-1 rounded-full hover:bg-gray-200 cursor-pointer"
          onClick={handleOpenShowDetails}
        />
      </div>
    </nav>
  );
};

export default GroupChatHeader;
