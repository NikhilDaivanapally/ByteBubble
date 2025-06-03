import React, { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "../../hooks/use-debounce";
import { Icons } from "../../icons";
import Input from "./Input";

type SearchInputProps = {
  setFilteredConversations: React.Dispatch<React.SetStateAction<any>>;
  conversations: any[];
};

const SearchInput: React.FC<SearchInputProps> = ({
  setFilteredConversations,
  conversations,
}) => {
  const [filter, setFilter] = useState("");

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
    },
    []
  );

  const handleFilterConversation = () => {
    const value = filter.toLowerCase().trim();
    const regex = new RegExp(value, "i");

    const filtered = value
      ? conversations.filter(
          (conv) => regex.test(conv?.name) || regex.test(conv?.email)
        )
      : conversations;
    setFilteredConversations(filtered);
  };

  const debounce = useDebounce({ func: handleFilterConversation, delay: 300 });

  useEffect(() => {
    debounce();
  }, [filter, conversations]);

  return (
    <Input
      type="text"
      name="search"
      placeholder="Search by name, email"
      startIcon={<Icons.MagnifyingGlassIcon className="w-5 text-gray-500" />}
      onChange={handleFilterChange}
    />
  );
};

export default React.memo(SearchInput);
