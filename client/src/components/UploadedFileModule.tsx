import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useCallback, useState } from "react";
import SendMediaMessage from "./SendMediaMessage";
import {
  updateMediaFiles,
  updateMediaPreviewUrls,
} from "../store/slices/appSlice";
import { Icons } from "../icons";

const UploadedFileModule = () => {
  const dispatch = useDispatch();
  const { mediaPreviewUrls } = useSelector((state: RootState) => state.app);
  const [activeIndex, setActiveIndex] = useState(
    mediaPreviewUrls?.length - 1 || 0
  );

  const handleResetmediaFiles_mediaPreviewUrls = useCallback(() => {
    dispatch(updateMediaFiles(null));
    dispatch(updateMediaPreviewUrls(null));
  }, []);

  return (
    <>
      {mediaPreviewUrls.length ? (
        <div className="absolute inset-0 flex-center flex-col gap-10 backdrop-blur z-50">
          <Icons.XMarkIcon
            className="w-8 absolute top-0 right-0 ml-auto cursor-pointer"
            onClick={handleResetmediaFiles_mediaPreviewUrls}
          />
          {/* main Image */}
          <img
            src={mediaPreviewUrls[activeIndex]?.url}
            // alt={mediaPreviewUrls[activeIndex]?.file}
            className="w-full max-w-xl mx-auto max-h-1/2"
          />

          {/* previews list */}
          <ul className="flex-center gap-4">
            {mediaPreviewUrls?.map((media, i) => {
              return (
                <li key={i} className="w-16 h-16 rounded-md">
                  <img src={media.url} alt="" className="w-full h-full" />
                </li>
              );
            })}
            <label className="w-16 h-16 border-2 flex-center border-gray-400 rounded-md cursor-pointer">
              <Icons.PlusIcon className="w-8 text-gray-400" />
              <input type="text" />
            </label>
          </ul>
          {/* send Media btn */}
          <SendMediaMessage />
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default UploadedFileModule;
