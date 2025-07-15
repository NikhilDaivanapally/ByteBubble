// message Read Indicator
const ReadIndicator = ({ read }: { read: boolean }) => (
  <div className="flex-center gap-1">
    <div
      className={`w-2 h-2 rounded-full ${
        read ? "bg-green-600" : "bg-gray-300"
      }`}
    />
    <div
      className={`w-2 h-2 rounded-full ${
        read ? "bg-green-600" : "bg-gray-300"
      }`}
    />
  </div>
);

export default ReadIndicator;
