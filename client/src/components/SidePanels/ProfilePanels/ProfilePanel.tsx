import { useSelector } from "react-redux";
import DirectProfileDetails from "./DirectProfileDetails";
import GroupProfileDetails from "./GroupProfileDetails";
import { RootState } from "../../../store/store";

type Props = {
  showDetails: boolean;
  handleCloseShowDetails: () => void;
};

const ProfilePanel = ({ showDetails, handleCloseShowDetails }: Props) => {
  const { chatType } = useSelector((state: RootState) => state.app);

  return chatType === "individual" ? (
    <DirectProfileDetails
      showDetails={showDetails}
      handleCloseShowDetails={handleCloseShowDetails}
    />
  ) : (
    <GroupProfileDetails
      showDetails={showDetails}
      handleCloseShowDetails={handleCloseShowDetails}
    />
  );
};

export default ProfilePanel;
