import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Avatar } from "../../components/ui/Avatar";
import { settingsData } from "../../data/settings.data";
import Section from "../../components/Settings/Section";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  clearActiveSettingPath,
  setActiveSettingPath,
} from "../../store/slices/settingsSlice";
import { Button } from "../../components/ui/Button";
import { apiSlice, useLogoutMutation } from "../../store/slices/api";
import { socket } from "../../socket";

const Settings = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth.user);
  const activeSettingPath = useSelector(
    (state: RootState) => state.settings.activeSettingPath
  );
  const { friends } = useSelector((state: RootState) => state.app);

  const [logout, { isLoading, data }] = useLogoutMutation();

  useEffect(() => {
    const path = pathname.split("/")?.filter(Boolean).at(1);
    if (path) {
      dispatch(setActiveSettingPath(pathname));
    }
  }, []);

  useEffect(() => {
    if (data) {
      socket.emit("exit", { user_id: auth?._id, friends });
      dispatch(apiSlice.util.resetApiState());
      dispatch({ type: "RESET_STORE" });
      navigate("/signin");
    }
  }, [data]);
  useEffect(() => {
    if (activeSettingPath) {
      dispatch(clearActiveSettingPath());
    }
  }, []);

  return (
    <div className="h-full relative flex">
      <div
        className={`px-2 sm:px-4 w-full md:w-2/5 xl:w-1/3 ${
          activeSettingPath ? "hidden md:block" : ""
        } space-y-2 border-r border-gray-200 overflow-y-auto overflow-x-hidden scrollbar-custom`}
      >
        <h1 className="text-2xl font-semibold py-2">Settings</h1>
        <div className="flex items-center gap-4">
          <Avatar size="2xl" url={auth?.avatar} />
          <div>
            <p className="text-2xl font-bold">{auth?.userName}</p>
            <p className="text-[#60758a]">{auth?.email}</p>
          </div>
        </div>
        <div className="w-fit ml-auto">
          <Button onClick={logout} loading={isLoading} className="">
            Log out
          </Button>
        </div>
        <div>
          {settingsData.map((section, idx) => (
            <Section key={idx} title={section.title} items={section.items} />
          ))}
        </div>
      </div>
      <div
        className={`w-full px-2 md:w-3/5 xl:w-2/3 ${
          activeSettingPath ? "block" : "hidden"
        } md:block`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
