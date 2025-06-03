import { useState } from "react";
import { UserProps } from "../types";
import ImageUpload from "./ui/ImageUpload";
import Input from "./ui/Input";
import MembersSelection from "./MembersSelection";
import { socket } from "../socket";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Button } from "./ui/Button";

type CreateGroupProps = {
  onClose: () => void;
  availableMembers: UserProps[];
};

const CreateGroup = ({ onClose, availableMembers }: CreateGroupProps) => {
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<UserProps[]>([]);
  const [errors, setErrors] = useState<{ name?: string; members?: string }>({});
  const user = useSelector((state: RootState) => state.auth.user);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validate form
    const newErrors: { name?: string; members?: string } = {};

    if (!groupName.trim()) {
      newErrors.name = "Group name is required";
    }
    if (selectedMembers.length === 0) {
      newErrors.members = "Please select at least one member";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    socket.emit("group:create", {
      title: groupName,
      image: groupImage,
      participants: selectedMembers,
      admin: user?._id,
    });

    // Reset form
    setGroupName("");
    setGroupImage(null);
    setSelectedMembers([]);
    setErrors({});

    // Close dialog
    onClose();
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <ImageUpload
        value={groupImage}
        onChange={(_, blobUrl) => {
          setGroupImage(blobUrl);
        }}
        name="Upload Group Image"
      />
      <Input
        placeholder="Group Name"
        onChange={(e) => setGroupName(e.target.value)}
      />
      <MembersSelection
        availableMembers={availableMembers}
        selectedMembers={selectedMembers}
        onChange={setSelectedMembers}
        error={errors.name}
      />
      <div className="flex gap-3 w-fit ml-auto">
        <Button variant="ghost" size="sm" shape="md">
          Cancel
        </Button>
        <Button variant="primary" size="sm" shape="md">
          Create Group
        </Button>
      </div>
    </form>
  );
};

export default CreateGroup;
