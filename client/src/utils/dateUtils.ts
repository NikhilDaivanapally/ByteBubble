export const formatTo12HourTime = (date: string) => {
  const time = new Date(date).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return time;
};

export const formatToDayLabel = (
  date: string
): "Today" | "Yesterday" | string => {
  const now = new Date();
  const input = new Date(date);

  const sameDay = now.toDateString() === input.toDateString();
  if (sameDay) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (yesterday.toDateString() === input.toDateString()) return "Yesterday";

  return formatToReadableDate(date);
};

export const formatToReadableDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
};

export const formatToFullDateString = (date: string) => {
  return new Date(Date.parse(date)).toDateString(); // Format: "Mon Jun 09 2025"
};

export const getConversationTime = (date: string) => {
  const label = formatToDayLabel(date);

  if (label === "Today") {
    return formatTo12HourTime(date);
  } else if (label === "Yesterday") {
    return "Yesterday";
  } else {
    return formatToReadableDate(date); // e.g., 09/06/2025
  }
};
