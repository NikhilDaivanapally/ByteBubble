import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useCallback, useEffect, useRef } from "react";
import { CameraIcon, XMarkIcon } from "@heroicons/react/16/solid";

import {
  updateMediaPreviewUrls,
  updateOpenCamera,
} from "../store/slices/appSlice";
import { parseFiles } from "../utils/parseFiles";

const CameraModule = () => {
  const dispatch = useDispatch();
  const cameraRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Store stream reference
  const { isCameraOpen } = useSelector((state: RootState) => state.app);

  const handleStreamData = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.log("Error while accessing Camera", error);
    }
  }, []);

  const stopStream = () => {
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleTakePicture = () => {
    if (cameraRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const video = cameraRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const parsed = await parseFiles([blob]);
            dispatch(updateMediaPreviewUrls(parsed));
            dispatch(updateOpenCamera(false));
          }
        },
        "image/webp",
        0.92
      ); // use WebP format
    }
  };

  const handleOffCamera = () => {
    dispatch(updateOpenCamera(false));
  };

  useEffect(() => {
    if (isCameraOpen) {
      handleStreamData();
    } else {
      stopStream();
    }

    return () => {
      stopStream(); // Stop when component unmounts
    };
  }, [isCameraOpen, handleStreamData]);

  return (
    <div className="absolute inset-0 flex-center flex-col gap-10 backdrop-blur z-50">
      <XMarkIcon
        className="w-8 absolute top-0 right-0 ml-auto cursor-pointer"
        onClick={handleOffCamera}
      />
      <video ref={cameraRef} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <CameraIcon className="w-10 cursor-pointer" onClick={handleTakePicture} />
    </div>
  );
};

export default CameraModule;
