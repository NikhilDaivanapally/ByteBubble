import { Icons } from "../icons";
import { Button } from "./ui/Button";
const Navbar = () => {
  return (
    <header className="border-b sticky top-0 z-50 border-gray-200 py-4 px-4 md:px-6 flex justify-between items-center backdrop-blur bg-white/70">
      <h1 className="text-lg md:text-xl font-semibold flex items-center gap-2">
        <Icons.RiChat1Fill className="text-2xl text-btn-primary" />
        Byte_Messenger
      </h1>

      <Button
        href="/signin"
        variant="primary"
        shape="pill"
        size="sm"
        icon={<Icons.ArrowUpRightIcon className="w-4" />}
        iconPosition="right"
      >
        Sign in
      </Button>
    </header>
  );
};

export default Navbar;
