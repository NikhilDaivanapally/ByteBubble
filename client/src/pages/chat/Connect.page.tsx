import { useSearchParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import { useEffect, useMemo } from "react";
import Requests from "../../components/connect_tabs/Request.tab";
import Friends from "../../components/connect_tabs/Friends.tab";
import ConnectUsers from "../../components/connect_tabs/Connect_Users.tab";

const Connect = () => {
  const Tabs = ["requests", "friends", "connect"];
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "Requests";
  const handleTabClick = (tab: string) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") as string;
    if (!Tabs.includes(tab)) return;
  }, [searchParams]);

  const currentTabComponent = useMemo(() => {
    switch (currentTab) {
      case Tabs[0]:
        return <Requests />;
      case Tabs[1]:
        return <Friends />;
      case Tabs[2]:
        return <ConnectUsers />;
      default:
        return <p>Select a Tab</p>;
    }
  }, [currentTab]);

  return (
    <div className="h-full p-4 md:px-20 md:py-5 flex flex-col">
      <ul className="list-none flex justify-around">
        {Tabs.map((tabName, index: number) => {
          return (
            <Button
              key={index}
              kind={currentTab == tabName ? "primary" : "primary_outline"}
              className=""
              onClick={() => handleTabClick(tabName.toLowerCase())}
            >
              {tabName
                .replace("-", " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Button>
            // <li key={index} onClick={(e) => {}}>
            //   {tabName}
            // </li>
          );
        })}
      </ul>
      <div className="flex-1 flex-center">{currentTabComponent}</div>
    </div>
  );
};

export default Connect;
