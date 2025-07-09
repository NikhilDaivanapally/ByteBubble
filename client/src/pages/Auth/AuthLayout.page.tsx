import { Outlet } from "react-router-dom";
import { AuthAsideIcon } from "../../icons/SvgIcons";

const AuthLayout = () => {
  return (
    <section className="w-full h-full sm:p-6 md:p-10 xl:px-32">
      <section className="grid lg:grid-cols-2 w-full h-full rounded-lg lg:border border-gray-300 overflow-hidden">
        {/*Image for larger screens */}
        <aside className="hidden lg:flex flex-col justify-start w-full h-full border-r border-gray-300 bg-[#A294F9]/10 p-6">
          <h1 className="text-xl font-semibold">ByteBubble</h1>
          <AuthAsideIcon />
        </aside>
        <Outlet />
      </section>
    </section>
  );
};

export default AuthLayout;
