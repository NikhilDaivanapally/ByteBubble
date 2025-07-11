import { DirectMessageProps } from "../../../../types";
import { useDispatch } from "react-redux";
import { setfullImagePreview } from "../../../../store/slices/conversation";
import Loader from "../../../ui/Loader";
import { formatTo12HourTime } from "../../../../utils/dateUtils";
import { DirectMessageActions } from "../../../ui/Dropdowns/actions/DirectMessageActions";
import { MessageStatus } from "../../../MessageStatus";
import { useEffect, useState } from "react";
import { Icons } from "../../../../icons";

export const DirectImageMsg = ({
  el,
  from,
  scrollToBottom,
}: {
  el: DirectMessageProps;
  from: string;
  scrollToBottom: () => void;
}) => {
  const dispatch = useDispatch();
  const [aspectRatio, setAspectRatio] = useState<null | number>(null);

  const isOutgoing = !el?.isIncoming;
  const time = formatTo12HourTime(el?.createdAt);

  useEffect(() => {
    const img = new Image();
    img.src = el?.message?.imageUrl;
    img.onload = () => {
      const ratio = img.width / img.height;
      setAspectRatio(ratio);
    };
  }, [el?.message?.imageUrl]);

  return (
    <div
      className={`Media_msg relative overflow-hidden w-fit max-w-[90%] sm:max-w-[80%] lg:max-w-[60%] flex group items-start ${
        isOutgoing ? "ml-auto" : ""
      }`}
    >
      {isOutgoing && <DirectMessageActions message={el} />}

      <section
        aria-label={`Message from ${from} at ${time}`}
        className={`rounded-xl space-y-1`}
      >
        {/* Message Content */}
        <div
          className={`Media_Container p-1 relative border-1  shadow rounded-lg ${
            isOutgoing
              ? "bg-gray-300 rounded-br-none border-transparent shadow-gray-400"
              : "bg-white rounded-bl-none border-gray-200"
          }`}
        >
          {!aspectRatio ? (
            <div className="h-40 lg:h-50 aspect-square rounded-lg bg-gray-300 flex-center">
              <Icons.PhotoIcon className="text-gray-400 w-20 animate-pulse" />
            </div>
          ) : (
            <figure>
              <div
                className="relative cursor-pointer min-h-40 lg:min-h-50 min-w-40 rounded-lg overflow-hidden"
                style={{
                  aspectRatio, // Uses the real aspect ratio (e.g. 16/9, 9/16)
                }}
                onClick={() =>
                  dispatch(setfullImagePreview({ fullviewImg: el }))
                }
              >
                <img
                  src={el?.message?.imageUrl}
                  alt="Image Message"
                  onLoad={scrollToBottom}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover select-none"
                />

                {el.status === "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Loader />
                  </div>
                )}
              </div>

              <figcaption>
                {el?.message?.description && (
                  <p className="text-sm px-2 py-1">
                    {el?.message?.description}
                  </p>
                )}
              </figcaption>
            </figure>
          )}
        </div>

        {/* footer */}
        <MessageStatus
          isIncoming={el.isIncoming}
          status={el.status}
          isRead={el.isRead}
          time={time}
        />
      </section>
    </div>
  );
};
