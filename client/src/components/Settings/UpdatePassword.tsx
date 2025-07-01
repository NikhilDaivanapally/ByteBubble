import React, { FormEvent, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Icons } from "../../icons";
import Input from "../ui/Input";
import { motion } from "motion/react";
import toast from "react-hot-toast";
import { useUpdatePasswordMutation } from "../../store/slices/api";

type UpdatePasswordProps = {
  onClose: () => void;
};

const UpdatePassword = ({ onClose }: UpdatePasswordProps) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const [updatePassword, { isLoading, data, error }] =
    useUpdatePasswordMutation();

  useEffect(() => {
    if (data) {
      toast.success(data.message || "Password updated successfully");
      onClose();
    }

    if (error && "data" in error) {
      const errData = error.data as { message?: string };
      toast.error(errData.message || "Failed to update password");
    }
  }, [data, error, onClose]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    updatePassword({
      currentPassword: currentPassword,
      newPassword: newPassword,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 flex items-center justify-center bg-white"
    >
      <Button
        variant="ghost"
        icon={<Icons.XMarkIcon className="w-6" />}
        size="xs"
        shape="full"
        className="absolute top-5 right-5"
        onClick={onClose}
        aria-label="Close update password form"
      />

      <div className="w-full max-w-md bg-white p-6">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Update Password
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="currentPassword"
              className="font-medium text-sm mb-1"
            >
              Current Password
            </label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="newPassword" className="font-medium text-sm mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="confirmPassword"
              className="font-medium text-sm mb-1"
            >
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="md" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UpdatePassword;
