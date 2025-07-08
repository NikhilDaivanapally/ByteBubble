import { Link } from "react-router-dom";
import { SettingIcon } from "../../icons/SettingIcons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { setActiveSettingPath } from "../../store/slices/settingsSlice";

const SettingItem = ({ icon, title, path, description }: any) => {
  const dispatch = useDispatch();

  const activeSettingPath = useSelector(
    (state: RootState) => state.settings.activeSettingPath
  );
  return (
    <Link
      to={path}
      className={`flex items-center gap-4 px-4 py-1 mb-1 hover:bg-gray-100  ${
        activeSettingPath === path ? "bg-gray-100" : "bg-white"
      } rounded-md cursor-pointer transition`}
      onClick={() => dispatch(setActiveSettingPath(path))}
    >
      <div className="bg-[#f0f2f5] size-12 rounded-lg flex items-center justify-center text-[#111418]">
        <SettingIcon name={icon} />
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-base font-medium text-[#111418] line-clamp-1">
          {title}
        </p>
        <p className="text-sm text-[#60758a]">{description}</p>
      </div>
    </Link>
  );
};

export default SettingItem;
