import { Link, useLocation } from "react-router-dom";
import { navListData } from "../../data/navigation.data";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Avatar } from "../ui/Avatar";
import { direct } from "../../utils/conversation-types";
const LayoutNavbar = () => {
  const { pathname } = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const { activeChatId, unreadCount } = useSelector(
    (state: RootState) => state.app
  );
  const directNotificationEnabled = useSelector(
    (state: RootState) =>
      state.settings.data.notifications.messages.messageNotifications
  );
  const groupNotificationEnabled = useSelector(
    (state: RootState) =>
      state.settings.data.notifications.groupChats.groupChatNotifications
  );
  return (
    <nav
      className={`w-full h-fit lg:h-full lg:w-20 flex ${
        activeChatId ? "hidden md:flex" : ""
      } lg:flex-col justify-between items-center px-4 py-2 lg:px-0 lg:py-4`}
    >
      <div>logo</div>
      <ul className="list-none flex gap-2 sm:gap-5 lg:flex-col relative h-full lg:h-fit lg:w-full justify-center items-center">
        {navListData?.map((item, i) => {
          const isActive = item.path.includes(pathname);
          const count =
            item.path == "/chat"
              ? unreadCount.directChats
              : item.path == "/group"
              ? unreadCount.groupChats
              : 0;
          const notificationEnabled =
            item.path == "/chat"
              ? directNotificationEnabled
              : item.path == "/group"
              ? groupNotificationEnabled
              : false;
          return (
            <li
              key={i}
              className="w-fit aspect-square p-2 relative rounded-lg cursor-pointer group"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-highlight"
                  className="absolute inset-0 bg-btn-primary/20 rounded-lg z-0"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <Link to={item.path}>
                <div className="relative z-10 flex justify-center items-center w-full h-full ">
                  <item.icon
                    className={`w-6 sm:w-7 ${
                      isActive
                        ? "fill-btn-primary"
                        : "fill-light stroke-[0.7px] stroke-black"
                    }`}
                  />
                  {notificationEnabled && Boolean(count) && (
                    <div className="absolute bottom-4/5 left-full w-4.5 h-4.5 leading-none flex-center rounded-full text-xs text-black/60 bg-btn-primary/40">
                      {count}
                    </div>
                  )}
                </div>
              </Link>

              <p className="tooltip hidden lg:block absolute z-20 shadow-lg transition opacity-0 group-hover:opacity-100 duration-200 left-full top-1/2 -translate-y-1/2 translate-x-1 py-1 text-sm rounded-full px-2 bg-gray-100 border border-gray-200">
                {item.name}
              </p>
            </li>
          );
        })}
      </ul>
      <Avatar size="lg" url={user?.avatar} fallBackType={direct} />
    </nav>
  );
};

export default LayoutNavbar;
