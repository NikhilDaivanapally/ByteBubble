import { useMemo } from "react";
import pdfIcon from "../assets/pdf.png";
import docIcon from "../assets/doc.png";
import csvIcon from "../assets/csv.png";
import xlsIcon from "../assets/xls.png";
import zipIcon from "../assets/zip-folder.png";
import fileIcon from "../assets/file.png";

export const useFileIcon = (fileExt: String | undefined) => {
  const FileIcon = useMemo(() => {
    switch (fileExt) {
      case "pdf":
        return pdfIcon;
      case "doc":
      case "docx":
        return docIcon;
      case "xls":
      case "xlsx":
        return xlsIcon;
      case "csv":
        return csvIcon;
      case "zip":
        return zipIcon;
      default:
        return fileIcon;
    }
  }, [fileExt]);

  return { FileIcon };
};
