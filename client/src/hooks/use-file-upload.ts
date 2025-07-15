import { useCallback, useRef } from "react";
import toast from "react-hot-toast";

// Constants
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const useFileUpload = (
  onImageUpload: (file: File | null, blobUrl: string | null) => void
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File must be less than ${MAX_FILE_SIZE_MB}MB`);
        clearInput();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onImageUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload] 
  );

  const handleRemoveImage = useCallback(() => {
    onImageUpload(null, null);
    clearInput();
  }, [onImageUpload]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    handleFileChange,
    handleRemoveImage,
    triggerFileInput,
  };
};
