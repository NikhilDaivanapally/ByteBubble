import { Icons } from "../../icons";

const NoChat = () => {
  return (
    <div className="w-full h-full flex-center flex-col">
      <Icons.RiChat1Fill className="text-6xl"/>
      <p className="text-lg">
        Select a conversation to start chat</p>
    </div>
  );
};

export default NoChat;
