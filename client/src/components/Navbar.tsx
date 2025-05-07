import Button from "./ui/Button";
import { ArrowUpRightIcon } from "@heroicons/react/16/solid";
const Navbar = () => {
  return (
    <header className="border-b sticky top-0 z-50 border-gray-200 py-4 px-4 md:px-6 flex justify-between items-center backdrop-blur bg-white/70">
      <h1 className="text-lg md:text-xl font-semibold">Byte_Messenger</h1>

      <Button href="/signin">
        {" "}
        Sign in <ArrowUpRightIcon className="w-4" />
      </Button>
    </header>
  );
};

export default Navbar;
