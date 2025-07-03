function generateRecordedFileName(userId: string | undefined) {
  const timestamp = Date.now(); // milliseconds since epoch
  const randomSuffix = Math.random().toString(36).substring(2, 8); // random 6-char string
  const prefix = "audio";

  const fileName = userId
    ? `${prefix}_${userId}_${timestamp}_${randomSuffix}.webm`
    : `${prefix}_${timestamp}_${randomSuffix}.webm`;

  return fileName;
}

export function getAudioMetadata(
  fileOrBlob: Blob | File | null,
  userId: string | undefined
) {
  return new Promise<{
    fileName: string;
    fileSize: number;
    fileType: string;
    duration: number;
  }>((resolve, reject) => {
    if (!(fileOrBlob instanceof Blob)) {
      return reject(
        new Error("Invalid file or blob passed to getAudioMetadata")
      );
    }

    const audio = document.createElement("audio");
    audio.preload = "metadata";

    const url = URL.createObjectURL(fileOrBlob);
    audio.src = url;

    const cleanUp = () => URL.revokeObjectURL(url);

    audio.oncanplaythrough = () => {
      cleanUp();

      resolve({
        fileName:
          (fileOrBlob as File)?.name || generateRecordedFileName(userId),
        fileSize: fileOrBlob.size,
        fileType: fileOrBlob.type,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    };

    audio.onerror = () => {
      cleanUp();
      reject(new Error("Failed to load audio metadata."));
    };
  });
}
