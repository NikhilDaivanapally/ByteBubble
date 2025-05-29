import { motion, AnimatePresence } from "motion/react";
import { Icons } from "../icons";
import { useMemo, useState } from "react";
import SortMessages from "../utils/sort-messages";
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { setfullImagePreview } from "../store/slices/conversation";
import { AudioMsg } from "./MessageTypes";
type ShowMediaProps = {
  showAllMedia: boolean;
  handleCloseAllMedia: () => void;
};

const Media = () => {
  const dispatch = useDispatch();
  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  const messages =
    chatType == "individual"
      ? direct_chat?.current_direct_messages
      : group_chat?.current_group_messages;
  console.log(messages);

  const { DatesArray, MessagesObject } = SortMessages({
    messages: messages,
    filter: "photo",
    sort: "Desc",
  });
  return (
    <>
      {DatesArray.length ? (
        DatesArray?.map((date, i) => {
          return (
            <div key={i} className="space-y-2 mb-10">
              <p className="text-sm text-black/60 py-2 border-b border-black/60">
                {date}
              </p>
              <div className="grid grid-cols-3 gap-4 items-center">
                {MessagesObject[date].map((el: any, i: number) => (
                  // <MediaMsg el={el}/>
                  <img
                    key={i}
                    src={el?.message?.photoUrl}
                    alt=""
                    onClick={() =>
                      dispatch(setfullImagePreview({ fullviewImg: el }))
                    }
                  />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div>No Media Messages Found</div>
      )}
    </>
  );
};
const Audio = () => {
  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  const messages =
    chatType == "individual"
      ? direct_chat?.current_direct_messages
      : group_chat?.current_group_messages;
  console.log(messages);

  const { DatesArray, MessagesObject } = SortMessages({
    messages: messages,
    filter: "audio",
    sort: "Desc",
  });
  return (
    <>
      {DatesArray.length ? (
        DatesArray?.map((date, i) => {
          return (
            <div key={i} className="space-y-2 mb-10">
              <p className="text-sm text-black/60 py-2 border-b border-black/60">
                {date}
              </p>
              <div className="grid  gap-4 items-center">
                {MessagesObject[date].map((el: any, i: number) => (
                  <AudioMsg el={el} key={i} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div>No Audio Messages Found</div>
      )}
    </>
  );
};
const Links = () => {
  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  const messages =
    chatType == "individual"
      ? direct_chat?.current_direct_messages
      : group_chat?.current_group_messages;
  console.log(messages);

  const { DatesArray, MessagesObject } = SortMessages({
    messages: messages,
    filter: "link",
    sort: "Desc",
  });
  return (
    <>
      {DatesArray.length ? (
        DatesArray?.map((date, i) => {
          return (
            <div key={i} className="TimeWise_Media_Container">
              <p>{date}</p>
              <div className="Links_Gallery">
                {/* {MessagesObject[date].map((el, i) => (
                  <LinkMsg el={el} key={i} />
                ))} */}
              </div>
            </div>
          );
        })
      ) : (
        <div>No Links Messages Found</div>
      )}
    </>
  );
};
const Docs = () => {
  const { chatType } = useSelector((state: RootState) => state.app);
  const { direct_chat, group_chat } = useSelector(
    (state: RootState) => state.conversation
  );

  const messages =
    chatType == "individual"
      ? direct_chat?.current_direct_messages
      : group_chat?.current_group_messages;
  console.log(messages);

  const { DatesArray, MessagesObject } = SortMessages({
    messages: messages,
    filter: "Docs",
    sort: "Desc",
  });
  return (
    <>
      {DatesArray.length ? (
        DatesArray?.map((date, i) => {
          return (
            <div key={i} className="TimeWise_Media_Container">
              <p>{date}</p>
              <div className="Links_Gallery">
                {/* {MessagesObject[date].map((el, i) => (
                  <LinkMsg el={el} key={i} />
                ))} */}
              </div>
            </div>
          );
        })
      ) : (
        <div>No Documents Found</div>
      )}
    </>
  );
};

const ShowMedia = ({ showAllMedia, handleCloseAllMedia }: ShowMediaProps) => {
  const [currentTab, setCurrentTab] = useState("media");
  const handleChangeTab = (tab: string) => {
    setCurrentTab(tab);
  };

  const Tabs = ["media", "audio", "links", "docs"];

  const currentTabComponent = useMemo(() => {
    switch (currentTab) {
      case "media":
        return <Media />;
      case "audio":
        return <Audio />;
      case "links":
        return <Links />;
      case "docs":
        return <Docs />;
      default:
        return <p>Select a Tab</p>;
    }
  }, [currentTab]);

  const currentIndex = Tabs.findIndex((tab) => tab === currentTab);

  return (
    <>
      <AnimatePresence>
        {showAllMedia && (
          <motion.div
            key="profile-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            className="w-full h-full bg-white absolute top-0 left-0 z-10 p-3.5 flex flex-col gap-1 overflow-hidden"
          >
            <button onClick={handleCloseAllMedia}>
              <Icons.ArrowLeftIcon className="w-8 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition" />
            </button>

            <div className="flex h-full flex-col overflow-hidden gap-2">
              <ul className="relative list-none flex gap-1 justify-around bg-btn-primary/30 w-full p-1.5 rounded-lg mx-auto">
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute w-1/4 inset-y-1.5 bg-white rounded-lg shadow z-1"
                  style={{
                    left:
                      currentTab === "media"
                        ? "6px"
                        : `${currentIndex * 24.8}%`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    duration: 0.3,
                  }}
                />
                {Tabs.map((name, index) => (
                  <button
                    key={index}
                    className="w-full p-1.5 z-2 rounded-lg cursor-pointer flex-center gap-1"
                    onClick={() => handleChangeTab(name)}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </button>
                ))}
              </ul>
              <div className="flex-1 overflow-x-hidden overflow-y-auto">
                {currentTabComponent}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShowMedia;
