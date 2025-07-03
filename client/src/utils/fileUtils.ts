export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const truncateFilename = (filename: string, maxLength = 50): string => {
  if (filename.length <= maxLength) return filename;

  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return filename.slice(0, maxLength) + "…";

  const name = filename.slice(0, dotIndex);
  const ext = filename.slice(dotIndex);
  const truncatedName = name.slice(0, maxLength - ext.length - 1); // leave space for ellipsis and extension
  return `${truncatedName}…${ext}`;
};
