import { DirectMessageProps, GroupMessageProps } from "../types";
import { formatToFullDateString } from "./dateUtils";

type SortMessageProps = {
  filter?: string | null;
  sort?: string;
  messages?: DirectMessageProps[] | GroupMessageProps[];
};

const SortMessages = (Props: SortMessageProps) => {
  const { messages, filter = null, sort = "Asc" } = Props;
  const MessagesObject: any = {};
  const Media_messages = filter
    ? messages?.filter((el) => el.messageType == filter)
    : messages;

  Media_messages?.forEach((Msg) => {
    const FromatDate = formatToFullDateString(Msg.createdAt); // ex wed jul 3 2024
    MessagesObject[FromatDate]
      ? MessagesObject[FromatDate].push(Msg)
      : (MessagesObject[FromatDate] = [Msg]);
  });
  const DatesArray = Object.keys(MessagesObject);
  switch (sort) {
    case "Asc":
      DatesArray.sort((a, b) => Date.parse(a) - Date.parse(b));
      break;
    case "Desc":
      DatesArray.sort((a, b) => Date.parse(b) - Date.parse(a));
      break;
  }

  return { DatesArray, MessagesObject };
};
export default SortMessages;
