import React from "react";
import { formatToDayLabel } from "../../../../utils/dateUtils";

export const GroupTimelineMsg = React.memo(({ date }: { date: string }) => {
  const label: string = formatToDayLabel(date);

  return (
    <div className="w-full relative flex-center text-center ">
      <p className="text-xs text-black/60 px-2 py-1 z-2 bg-gray-300 rounded-md">
        {label}
      </p>
    </div>
  );
});
