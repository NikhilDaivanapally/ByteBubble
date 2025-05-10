type LoaderProps = {
  customColor?: boolean;
};
const Loader: React.FC<LoaderProps> = ({ customColor }) => {
  return (
    <svg className="w-10 h-10 origin-center" viewBox="20 24 60 50">
      <circle
        className={`spin animate-load ${
          customColor ? "stroke-btn-primary" : "stroke-white"
        }`}
        r="20"
        cy="50"
        cx="50"
      ></circle>
    </svg>
  );
};

export default Loader;
