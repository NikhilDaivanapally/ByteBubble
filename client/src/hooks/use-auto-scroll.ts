import { useEffect } from "react";

const useAutoScroll = ({
  ref,
  deps = [],
}: {
  ref: React.RefObject<HTMLElement | null>;
  deps?: any[];
}) => {
  useEffect(() => {
    const scroll = () => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    };
    const timeout = setTimeout(scroll, 100);
    return () => clearTimeout(timeout);
  }, [ref, ...deps]);
};

export default useAutoScroll;
