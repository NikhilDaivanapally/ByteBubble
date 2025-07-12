import { useDispatch, useSelector } from "react-redux";
import { GroupSystemEventType } from "../constants/system-event-types";
import { Icons } from "../icons";
import { RootState } from "../store/store";
import { Button } from "../components/ui/Button";
import { useCallback } from "react";
import { setIsGroupInfoActive } from "../store/slices/appSlice";
import { Avatar } from "../components/ui/Avatar";

type User = { _id: string; userName: string };

export const generateGroupSystemMessage = ({
  eventType,
  from,
  to,
  currentUserId,
}: {
  eventType: GroupSystemEventType;
  from: User | null;
  to: User | null;
  currentUserId: string;
}) => {
  const dispatch = useDispatch();
  const fromName = from?._id === currentUserId ? "You" : from?.userName;
  const toName = to?._id === currentUserId ? "you" : to?.userName;
  const currentConversation = useSelector(
    (state: RootState) =>
      state.conversation.group_chat.current_group_conversation
  );

  const handleOpenProfile = useCallback(() => {
    dispatch(setIsGroupInfoActive(true));
  }, [dispatch]);

  switch (eventType) {
    case GroupSystemEventType.GROUP_CREATED:
      return from?._id === currentUserId ? (
        <div className="flex-center flex-col gap-1 bg-gray-300 p-4 px-8 rounded-2xl">
          <div className="rounded-full bg-gray-400/20">
            <Avatar size="xl" url={currentConversation?.avatar} />
          </div>
          <p className="font-semibold">You created this Group</p>
          <span className="text-sm">
            {currentConversation?.users.length} members
          </span>
          <div className="space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              shape="pill"
              iconPosition="left"
              icon={
                <Icons.InformationCircleIcon className="w-4 text-btn-primary" />
              }
              onClick={handleOpenProfile}
            >
              Group Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              shape="pill"
              iconPosition="left"
              icon={<Icons.UserPlusIcon className="w-4 text-btn-primary" />}
            >
              Add Members
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-center flex-col gap-1 bg-gray-300 p-4 px-8 rounded-2xl">
          <div className="rounded-full bg-gray-400/20">
            <Avatar size="xl" url={currentConversation?.avatar} />
          </div>
          <p className="font-semibold">{from?.userName} added you</p>
          <span className="text-sm">
            {currentConversation?.users.length} members
          </span>
          <div className="space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              shape="pill"
              iconPosition="left"
              icon={
                <Icons.InformationCircleIcon className="w-4 text-btn-primary" />
              }
              onClick={handleOpenProfile}
            >
              Group Info
            </Button>
            <Button
              variant="outline"
              size="sm"
              shape="pill"
              iconPosition="left"
              icon={<Icons.UserPlusIcon className="w-4 text-btn-primary" />}
            >
              Add Members
            </Button>
          </div>
        </div>
      );
    case GroupSystemEventType.GROUP_RENAMED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {fromName} changed the group name to "{currentConversation?.name}";
        </p>
      );
    case GroupSystemEventType.GROUP_ICON_CHANGED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {fromName} changed the group's icon
        </p>
      );
    case GroupSystemEventType.GROUP_DESCRIPTION_UPDATED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {fromName} changed the group description{" "}
          <span onClick={handleOpenProfile}>Click to view</span>
        </p>
      );
    case GroupSystemEventType.ADMIN_ASSIGNED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {from?._id == currentUserId
            ? `you're now an admin`
            : `${fromName} assigned ${toName} as admin`}
        </p>
      );
    case GroupSystemEventType.ADIM_REMOVED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {from?._id == currentUserId
            ? `you're no longer an admin`
            : `${fromName} removed ${toName} from admin`}
        </p>
      );
    case GroupSystemEventType.USER_ADDED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {fromName} added {toName};
        </p>
      );
    case GroupSystemEventType.USER_REMOVED:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {fromName} removed {toName};
        </p>
      );
    case GroupSystemEventType.USER_LEFT:
      return (
        <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
          {fromName} left;
        </p>
      );
    default:
      return "System notification";
  }
};
