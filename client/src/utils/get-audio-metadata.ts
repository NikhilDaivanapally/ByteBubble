function generateRecordedFileName(userId: string | undefined): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const prefix = "audio";
 
  return userId 
    ? `${prefix}_${userId}_${timestamp}_${randomSuffix}.webm` 
    : `${prefix}_${timestamp}_${randomSuffix}.webm`;
}

export function getAudioMetadata(
  fileOrBlob: Blob | File | null,
  userId: string | undefined
): Promise<{
  fileName: string;
  fileSize: number;
  fileType: string;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    if (!(fileOrBlob instanceof Blob)) {
      return reject(
        new Error("Invalid file or blob passed to getAudioMetadata")
      );
    }

    const audio = document.createElement("audio");
    audio.preload = "metadata";
    
    const url = URL.createObjectURL(fileOrBlob);
    audio.src = url;

    const cleanUp = () => {
      URL.revokeObjectURL(url);
      audio.remove();
    };

    const timeout = setTimeout(() => {
      cleanUp();
      reject(new Error("Timeout: Failed to load audio metadata within 10 seconds"));
    }, 10000);

    // Use loadedmetadata event instead of canplaythrough
    audio.addEventListener("loadedmetadata", () => {
      clearTimeout(timeout);
      cleanUp();

      resolve({
        fileName: (fileOrBlob as File)?.name || generateRecordedFileName(userId),
        fileSize: fileOrBlob.size,
        fileType: fileOrBlob.type,
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    });

    audio.addEventListener("error", () => {
      clearTimeout(timeout);
      cleanUp();
      reject(new Error("Failed to load audio metadata"));
    });

    // Fallback: if loadedmetadata doesn't fire, try durationchange
    audio.addEventListener("durationchange", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        clearTimeout(timeout);
        cleanUp();
        
        resolve({
          fileName: (fileOrBlob as File)?.name || generateRecordedFileName(userId),
          fileSize: fileOrBlob.size,
          fileType: fileOrBlob.type,
          duration: audio.duration,
        });
      }
    });
  });
}

// Alternative approach using Web Audio API for more reliable duration detection
export async function getAudioMetadataWithWebAudio(
  fileOrBlob: Blob | File | null,
  userId: string | undefined
): Promise<{
  fileName: string;
  fileSize: number;
  fileType: string;
  duration: number;
}> {
  if (!(fileOrBlob instanceof Blob)) {
    throw new Error("Invalid file or blob passed to getAudioMetadata");
  }

  try {
    const arrayBuffer = await fileOrBlob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      return {
        fileName: (fileOrBlob as File)?.name || generateRecordedFileName(userId),
        fileSize: fileOrBlob.size,
        fileType: fileOrBlob.type,
        duration: audioBuffer.duration,
      };
    } finally {
      // Close the audio context to free up resources
      if (audioContext.state !== 'closed') {
        await audioContext.close();
      }
    }
  } catch (error) {
    throw new Error(`Failed to decode audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Hybrid approach that tries Web Audio API first, falls back to HTML Audio
export async function getAudioMetadataReliable(
  fileOrBlob: Blob | File | null,
  userId: string | undefined
): Promise<{
  fileName: string;
  fileSize: number;
  fileType: string;
  duration: number;
}> {
  if (!(fileOrBlob instanceof Blob)) {
    throw new Error("Invalid file or blob passed to getAudioMetadata");
  }

  // Try Web Audio API first (more reliable for duration)
  try {
    return await getAudioMetadataWithWebAudio(fileOrBlob, userId);
  } catch (webAudioError) {
    console.warn("Web Audio API failed, falling back to HTML Audio:", webAudioError);
    
    // Fall back to HTML Audio approach
    return getAudioMetadata(fileOrBlob, userId);
  }
}