import { useRef } from "react";
import { motion } from "framer-motion";
import { Icons } from "../../icons";
import toast from "react-hot-toast";

type SizeVariant = "sm" | "md" | "lg";

type ImageUploadProps = {
  value: string | null;
  onChange: (file: File | null, blobUrl: string | null) => void;
  name: string;
  size?: SizeVariant;
};

const sizeMap = {
  sm: "w-16 h-16 text-sm",
  md: "w-24 h-24 text-base",
  lg: "w-32 h-32 text-lg",
};

const ImageUpload = ({
  value,
  onChange,
  name,
  size = "md",
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeInMB = 2;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSizeInBytes) {
        toast.error(`File must be less than ${maxSizeInMB}MB`);
        fileInputRef.current!.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onChange(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={`
            rounded-full overflow-hidden flex items-center justify-center
            border-2 border-dashed border-gray-300 bg-gray-50 transition-colors
            ${sizeMap[size]}
            ${value ? "border-solid border-indigo-200" : ""}
          `}
        >
          {value ? (
            <motion.img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600">
              <Icons.CameraIcon className="text-gray-400 w-6 h-6" />
            </div>
          )}
        </div>

        {value && (
          <motion.button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 shadow-sm border border-red-200 hover:bg-red-200 transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            <Icons.XMarkIcon className="text-red-500 w-4" />
          </motion.button>
        )}

        <motion.div
          className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          whileHover={{ scale: 1.1 }}
        >
          <Icons.CameraIcon className="text-gray-500 w-4" />
        </motion.div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={`Upload image for ${name}`}
      />
      <p className="text-xs text-gray-500 mt-3">{name}</p>
    </div>
  );
};

export default ImageUpload;
