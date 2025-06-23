import { useCallback, useEffect, useRef, useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Input from "../ui/Input";
import { Button } from "../ui/Button";
import { clearActiveSettingPage } from "../../store/slices/settingsSlice";
import { Icons } from "../../icons";
import { motion } from "framer-motion"; // ✅ fix import
import toast from "react-hot-toast";
import { useUpdateuserMutation } from "../../store/slices/apiSlice";
import { setUser } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth.user);

  const [name, setName] = useState(auth?.userName || "");
  const [about, setAbout] = useState(auth?.about || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [updateUser, { isLoading, data, error }] = useUpdateuserMutation();

  useEffect(() => {
    if (auth) {
      setName(auth.userName || "");
      setAbout(auth.about || "");
    }
  }, [auth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error(`File must be less than ${MAX_IMAGE_SIZE_MB}MB`);
      fileInputRef.current!.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
    setAvatar(file);
  };

  useEffect(() => {
    if (data?.data) {
      dispatch(setUser(data.data));
      toast.success("Profile updated");
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error("Something went wrong. Try again.");
    }
  }, [error]);

  const handleSave = async () => {
    const update: any = {};

    if (avatar) update.avatar = avatar;
    if (name.trim() && name !== auth?.userName) update.name = name.trim();
    if (about.trim() && about !== auth?.about) update.about = about.trim();

    if (Object.keys(update).length === 0) {
      toast("No changes to update");
      return;
    }
    try {
      await updateUser(update).unwrap();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleClearActiveSettingsPage = useCallback(() => {
    dispatch(clearActiveSettingPage());
    navigate("/settings");
  }, [dispatch]);

  const handleRemoveAvatar = () => {
    fileInputRef.current!.value = "";
    setAvatar(null);
    setImageUrl(null);
  };

  return (
    <div className="relative flex h-full flex-col bg-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-2 py-4 md:py-2 flex gap-3 md:block">
        <Icons.ArrowLeftIcon
          className="w-6 md:hidden cursor-pointer"
          onClick={handleClearActiveSettingsPage}
        />
        <h1 className="text-xl font-semibold text-[#121416]">Edit Profile</h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center py-10 px-4 overflow-y-auto">
        <section className="flex flex-col items-center gap-3">
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`rounded-full overflow-hidden w-20 h-20 flex items-center justify-center border-2 transition-colors ${
                imageUrl ? "border-indigo-200" : "border-gray-300"
              }`}
              style={{
                backgroundImage: imageUrl ? undefined : `url(${auth?.avatar})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: imageUrl ? "#f8fafc" : "#eef2ff",
              }}
            >
              {imageUrl && (
                <motion.img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>

            {imageUrl && (
              <motion.button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute -top-2 -right-2 cursor-pointer bg-red-100 rounded-full p-1 shadow-sm border border-red-200 hover:bg-red-200 transition-colors"
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
              <Icons.PencilIcon className="text-gray-500 w-4" />
            </motion.div>
          </motion.div>

          <input
            hidden
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />

          <h2 className="text-xl font-bold text-[#121416]">{auth?.userName}</h2>
          <p className="text-sm text-[#6a7681]">{auth?.email}</p>
        </section>

        {/* Form */}
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleSave();
          }}
          className="w-full max-w-md mt-10 flex flex-col gap-6"
        >
          <div className="flex flex-col">
            <label htmlFor="name" className="font-medium pb-1">
              Name
            </label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="about" className="font-medium text-[#121416] pb-1">
              About
            </label>
            <Input
              id="about"
              placeholder="Tell us about yourself"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="md" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;
