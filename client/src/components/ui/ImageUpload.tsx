import { useRef } from "react";
import { Icons } from "../../icons";

type ImageUploadProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  name: string;
};

const ImageUpload = ({ value, onChange, name }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className={`
            w-24 h-24 rounded-full overflow-hidden flex items-center justify-center
            border-2 border-dashed border-gray-300 bg-gray-50
           ${value ? "border-solid border-indigo-200" : ""}
          `}
        >
          {value ? (
            <img
              src={value}
              alt="Group"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-2xl font-semibold">
              <Icons.CameraIcon className="text-gray-400 w-8" />
            </div>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-1 -right-1 bg-red-100 rounded-full p-1 shadow-sm border border-red-200 hover:bg-red-200 transition-colors"
          >
            <Icons.XMarkIcon className="text-red-500 w-4 cursor-pointer" />
          </button>
        )}

        <div
          className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Icons.CameraIcon className="text-gray-500 w-4" />
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label={name}
      />
      <p className="text-xs text-gray-500 mt-3">{name}</p>
    </div>
  );
};

export default ImageUpload;
