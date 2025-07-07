import { Icons } from "../icons";

const Footer = () => {
  return (
    <div className="w-full py-8 border-t-1 border-gray-200">
      <p className="font-semibold flex items-center gap-2">
        <Icons.RiChat1Fill className="text-xl text-btn-primary" />
        Byte_Messenger
      </p>
      <ul className="flex-center gap-5 mb-2">
        <li>
          <Icons.FaFacebook className="text-xl text-gray-500" />
        </li>{" "}
        <li>
          <Icons.FaInstagram className="text-xl text-gray-500" />
        </li>{" "}
        <li>
          <Icons.FaLinkedin className="text-xl text-gray-500" />
        </li>{" "}
        <li>
          <Icons.FaYoutube className="text-xl text-gray-500" />
        </li>
      </ul>
      <p className="text-sm text-gray-500 text-center">
        @ 2025 Byte_Messenger. All rights reserved
      </p>
    </div>
  );
};

export default Footer;
