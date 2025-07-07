import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import SendMediaMessage from "./SendMediaMessage";
import { updateMediaFiles } from "../store/slices/appSlice";
import { Icons } from "../icons";
import { RootState } from "../store/store";
import { formatBytes, truncateFilename } from "../utils/fileUtils";

const FileSendPreview = () => {
  const dispatch = useDispatch();
  const { mediaFiles, mediaFilePreviews } = useSelector(
    (state: RootState) => state.app
  );

  const handleReset = useCallback(() => {
    dispatch(updateMediaFiles(null));
  }, [dispatch]);

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const renderPreview = (file: File, url: string, index: number) => {
    const type = file.type;
    const shortName = truncateFilename(file.name);
    const size = formatBytes(file.size);
    const ext = getFileExtension(file.name);

    if (type.startsWith("image/")) {
      return (
        <div key={index} className="w-full flex-center flex-col">
          <img
            src={url}
            alt={`image-${index}`}
            className="w-full max-h-100 object-contain rounded-lg"
          />
          <div className="flex gap-2 mt-2">
            <p>{shortName}</p>
            <p>{size}</p>
          </div>
        </div>
      );
    }

    if (type.startsWith("audio/")) {
      return (
        <div key={index} className="w-full flex-center flex-col">
          <audio controls src={url} className="w-full max-w-sm rounded" />
          <div className="flex gap-2 mt-2">
            <p>{shortName}</p>
            <p>{size}</p>
          </div>
        </div>
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
        <div key={index} className="w-full h-full flex-center flex-col">
          <iframe
            src={url}
            className="w-full h-200 rounded border"
            title={`pdf-${index}`}
          />
          <div className="flex gap-2 mt-2">
            <p>{shortName}</p>
            <p>{size}</p>
          </div>
        </div>
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

  if (!mediaFiles || mediaFilePreviews?.length === 0) return null;

  return (
    <div className="absolute inset-0 flex-center flex-col gap-4 backdrop-blur z-50">
      <Icons.XMarkIcon
        className="w-8 absolute top-4 right-4 ml-auto cursor-pointer"
        onClick={handleReset}
      />

      <div className="flex flex-wrap w-full justify-center gap-4 overflow-hidden p-4">
        {mediaFilePreviews?.map(({ file, url }, index) =>
          renderPreview(file, url, index)
        )}
      </div>

      <SendMediaMessage />
    </div>
  );
};

export default FileSendPreview;
