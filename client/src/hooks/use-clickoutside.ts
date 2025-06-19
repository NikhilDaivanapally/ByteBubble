import { useEffect } from "react";

function useClickOutside(
  refs: React.RefObject<HTMLElement | null>[],
  handler: () => void,
  options?: { closeOnEscape?: boolean }
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        refs.every(ref => ref.current && !ref.current.contains(event.target as Node))
      ) {
        handler();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && options?.closeOnEscape !== false) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [refs, handler, options]);
}

export default useClickOutside;
