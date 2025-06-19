import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import SendMediaMessage from "./SendMediaMessage";
import {
  updateMediaFiles,
  updateMediaPreviewUrls,
} from "../store/slices/appSlice";
import { Icons } from "../icons";
import { previewObj } from "../types";

type FileSendPreviewProps = {
  files: previewObj[];
};

const FileSendPreview = ({ files }: FileSendPreviewProps) => {
  const dispatch = useDispatch();
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (files.length > 0) {
      setActiveIndex(files.length - 1);
    }
  }, [files]);

  const handleResetmediaFiles_mediaPreviewUrls = useCallback(() => {
    dispatch(updateMediaFiles(null));
    dispatch(updateMediaPreviewUrls(null));
  }, []);

  return (
    <div className="absolute inset-0 flex-center flex-col gap-10 backdrop-blur z-50">
      <Icons.XMarkIcon
        className="w-8 absolute top-0 right-0 ml-auto cursor-pointer"
        onClick={handleResetmediaFiles_mediaPreviewUrls}
      />
      {/* main Image */}
      <img
        src={files[activeIndex]?.url}
        // alt={mediaPreviewUrls[activeIndex]?.file}
        className="w-full max-w-xl mx-auto max-h-1/2"
      />

      {/* previews list */}
      <ul className="flex-center gap-4">
        {files?.map((media, i) => {
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
  );
};

export default FileSendPreview;
