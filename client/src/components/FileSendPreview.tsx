import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import SendMediaMessage from "./SendMediaMessage";
import {
  updateMediaFilePreviews,
  updateMediaFiles,
} from "../store/slices/appSlice";
import { Icons } from "../icons";
import { RootState } from "../store/store";

const FileSendPreview = () => {
  const dispatch = useDispatch();
  const { mediaFiles, mediaFilePreviews } = useSelector(
    (state: RootState) => state.app
  );

  useEffect(() => {
    if (!mediaFiles) return;

    const filesArray = Array.isArray(mediaFiles) ? mediaFiles : [mediaFiles];
    const previews = filesArray.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    dispatch(updateMediaFilePreviews(previews));

    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [mediaFiles]);

  const handleReset = useCallback(() => {
    console.log("clicking");
    dispatch(updateMediaFiles(null));
  }, [dispatch]);

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const renderPreview = (file: File, url: string, index: number) => {
    const type = file.type;
    const ext = getFileExtension(file.name);

    if (type.startsWith("image/")) {
      return (
        <img
          key={index}
          src={url}
          alt={`image-${index}`}
          className="w-full max-h-100 object-contain rounded-lg"
        />
      );
    }

    if (type.startsWith("audio/")) {
      return (
        <audio
          key={index}
          controls
          src={url}
          className="w-full max-w-sm rounded border"
        />
      );
    }

    if (type.startsWith("video/")) {
      return (
        <video
          key={index}
          controls
          src={url}
          className="w-full object-contain rounded-lg"
        />
      );
    }

    if (type === "application/pdf") {
      return (
        <iframe
          key={index}
          src={url}
          className="w-full h-200 rounded border"
          title={`pdf-${index}`}
        />
      );
    }

    const docTypes = ["doc", "docx", "txt", "rtf", "xlsx", "zip"];
    if (docTypes.includes(ext)) {
      return (
        <div
          key={index}
          className="p-4 border rounded max-w-xs bg-gray-100 text-center"
        >
          <p className="mb-2">{file.name}</p>
          <a href={url} download className="text-blue-600 underline text-sm">
            Download {ext.toUpperCase()} File
          </a>
        </div>
      );
    }

    return (
      <div
        key={index}
        className="p-4 border rounded max-w-xs bg-gray-100 text-center"
      >
        <p className="mb-2">Unsupported: {file.name}</p>
        <a href={url} download className="text-blue-600 underline text-sm">
          Download File
        </a>
      </div>
    );
  };

  if (!mediaFiles || mediaFilePreviews.length === 0) return null;

  return (
    <div className="absolute inset-0 flex-center flex-col gap-4 backdrop-blur z-50">
      <Icons.XMarkIcon
        className="w-8 absolute top-4 right-4 ml-auto cursor-pointer"
        onClick={handleReset}
      />

      <div className="flex flex-wrap w-full justify-center gap-4 overflow-hidden p-4">
        {mediaFilePreviews.map(({ file, url }, index) =>
          renderPreview(file, url, index)
        )}
      </div>

      <SendMediaMessage />
    </div>
  );
};

export default FileSendPreview;
