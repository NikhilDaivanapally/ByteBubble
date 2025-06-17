import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import Requests from "../../components/connect-tabs/Request.tab";
import Friends from "../../components/connect-tabs/Friends.tab";
import ConnectUsers from "../../components/connect-tabs/ConnectUsers.tab";
import { motion } from "motion/react";
import { Icons } from "../../icons";

const Tabs = [
  { name: "requests", icon: Icons.UserPlusIcon },
  { name: "friends", icon: Icons.UsersIcon },
  { name: "connect", icon: Icons.UserIcon },
];

const Connect = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "requests";
  const currentIndex = Tabs.findIndex((tab) => tab.name === currentTab);
  const handleTabClick = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") as string;
    if (!Tabs.find((t) => t.name === tab)) return;
  }, [searchParams]);

  const currentTabComponent = useMemo(() => {
    switch (currentTab) {
      case "requests":
        return <Requests />;
      case "friends":
        return <Friends />;
      case "connect":
        return <ConnectUsers />;
      default:
        return <p>Select a Tab</p>;
    }
  }, [currentTab]);

  return (
    <div className="h-full pt-3 px-2 md:px-20 md:py-5 flex flex-col">
      <ul className="relative list-none flex gap-1 justify-around bg-btn-primary/30 w-full md:w-2xl p-1.5 rounded-lg mx-auto">
        <motion.div
          layoutId="activeTabBackground"
          className="absolute w-1/3 inset-y-1.5 bg-white rounded-lg shadow z-1"
          style={{
            left: currentTab === "requests" ? "6px" : `${currentIndex * 33}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            duration: 0.3,
          }}
        />
        {Tabs.map(({ name, icon: Icon }, index) => (
          <button
            key={index}
            className="w-full p-1.5 z-2 rounded-lg cursor-pointer flex-center gap-1"
            onClick={() => handleTabClick(name)}
          >
            <Icon className="w-5" />
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </ul>
      <div className="flex-1 flex justify-center">{currentTabComponent}</div>
    </div>
  );
};

export default Connect;
