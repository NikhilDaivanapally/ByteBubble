const ConversationSkeleton = () => {
  return (
    <div className="w-full flex gap-x-4 py-2 rounded-lg px-2">
      <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
      <div className="space-y-3">
        <p className="w-20 h-3 rounded-lg bg-gray-300 animate-pulse"></p>
        <p className="w-40 h-3 rounded-lg bg-gray-300 animate-pulse"></p>
      </div>
      <div className="ml-auto w-16 h-3 rounded-lg bg-gray-300 animate-pulse"></div>
    </div>
  );
};

export default ConversationSkeleton;
