const ResetPassword = () => {
  return <div className="w-full backdrop-blur flex-center flex-col  px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24 gap-4 py-10">
  {/* Show app name only on smaller screens */}
  <h1 className="lg:hidden absolute top-4 left-4 text-xl font-semibold">
    Byte_Messenger
  </h1>

  <h1 className="font-semibold text-2xl md:text-3xl text-center">
    Create an account
  </h1>
  <p className="text-center text-sm text-gray-600">
    Enter your email below to create your account
  </p>

  <input
    type="email"
    className="w-full p-3 border rounded-md outline-none focus:ring-2 focus:ring-[#A294F9] transition"
    placeholder="Email@example.com"
  />

  <button className="bg-[#A294F9] w-full text-white p-3 rounded-md font-medium hover:bg-[#8b7be8] transition">
    Sign in with Email
  </button>

  <button className="w-full p-3 border border-[#A294F9] rounded-md font-medium hover:bg-[#f5f3ff] transition">
    Continue with Google
  </button>
</div>;
};

export default ResetPassword;
