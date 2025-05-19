import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setfullImagePreview } from "../store/slices/conversation";
import { useRef } from "react";
import { Icons } from "../icons";

const ImagePreview = () => {
  const dispatch = useDispatch();
  const currentImgRef = useRef<HTMLLIElement>(null);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { direct_chat, group_chat, fullImagePreview } = useSelector(
    (state: RootState) => state.conversation
  );
  const { chatType } = useSelector((state: RootState) => state.app);
  const current_direct_conversation = direct_chat?.current_direct_conversation;
  const current_group_conversation = group_chat?.current_group_conversation;
  let MediaImgs = [];

  if (chatType == "individual") {
    MediaImgs = direct_chat?.current_direct_messages?.filter(
      (el) => el.type == "photo"
    );
  } else {
    MediaImgs = group_chat?.current_group_messages?.filter(
      (el) => el.type == "photo"
    );
  }
  const Current_index = MediaImgs.findIndex(
    (el) => el?.id == fullImagePreview?.id
  );

  const handleChangeImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.target as HTMLElement;
    const button = target.closest("button");

    if (!button) return;

    if (button.classList.contains("prev-btn") && Current_index > 0) {
      dispatch(
        setfullImagePreview({ fullviewImg: MediaImgs[Current_index - 1] })
      );
    } else if (
      button.classList.contains("next-btn") &&
      Current_index < MediaImgs.length - 1
    ) {
      dispatch(
        setfullImagePreview({ fullviewImg: MediaImgs[Current_index + 1] })
      );
    }
  };

  const handleClose = () => {
    dispatch(setfullImagePreview({ fullviewImg: null }));
  };

  console.log(Current_index);
  return (
    <div className="fixed z-60 flex flex-col gap-4 w-full h-full px-4 md:px-12 py-4 bg-light">
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex-center  gap-4">
          {/* profile Image */}
          <div className="w-10 h-10  relative">
            <img
              className="w-full h-full rounded-full object-cover"
              src={
                chatType === "individual"
                  ? fullImagePreview?.outgoing
                    ? authUser?.avatar
                    : current_direct_conversation?.avatar
                  : current_group_conversation?.img
              }
              alt=""
            />
            {true && (
              <span className="w-2 h-2 absolute bottom-0 right-0 bg-green-600 rounded-full"></span>
            )}
          </div>
          {/* profile Info */}
          <div className="">
            <p className="font-semibold">
              {chatType === "individual"
                ? fullImagePreview?.outgoing
                  ? "you"
                  : current_direct_conversation?.name
                : fullImagePreview?.outgoing
                ? "you"
                : current_group_conversation?.title}
            </p>
            <p className="text-sm text-black/60">
              {new Date(fullImagePreview?.createdAt!).toLocaleDateString()} at{" "}
              {new Date(fullImagePreview?.createdAt!).toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true, // Use 12-hour clock and show AM/PM
              })}
            </p>
          </div>
          <div></div>
        </div>

        <Icons.XMarkIcon
          className="w-6 md:w-8 cursor-pointer"
          onClick={handleClose}
        />
      </div>
      {/* Image carousel */}
      <div
        className="flex-1 overflow-hidden flex-center relative"
        onClick={() => {}}
      >
        <img
          src={fullImagePreview?.message.photoUrl}
          className="w-full h-full object-contain"
          alt=""
        />
        <button
          className="prev-btn absolute shadow bg-light rounded-full left-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleChangeImage}
          disabled={Current_index == 0}
        >
          <Icons.ChevronLeftIcon className="w-8 md:w-12" />
        </button>
        <button
          className="next-btn absolute shadow bg-light rounded-full right-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          onClick={handleChangeImage}
          disabled={Current_index == MediaImgs.length - 1}
        >
          <Icons.ChevronRightIcon className="w-8 md:w-12" />
        </button>
      </div>
      {/* Images list */}
      <div className="images_list_container py-2 border-t border-gray-400">
        <ul className="list-none flex items-center overflow-x-scroll  overflow-y-hidden gap-4">
          {MediaImgs?.map((el, i) => {
            return (
              <li
                key={i}
                className={`min-w-20 h-20 p-1 flex items-center justify-center border-2 cursor-pointer transition duration-200 rounded-md hover:border-gray-400 ${
                  fullImagePreview?.id === el.id
                    ? "border-gray-400"
                    : "border-transparent"
                }`}
                ref={fullImagePreview?.id === el.id ? currentImgRef : null}
                onClick={() =>
                  dispatch(
                    setfullImagePreview({
                      fullviewImg: el,
                    })
                  )
                }
              >
                <img
                  src={el.message.photoUrl}
                  alt=""
                  className="w-full h-full object-contain select-none"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ImagePreview;
