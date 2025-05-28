import { useRef, useCallback } from "react";

type UseDebounceProps<T extends (...args: any[]) => void> = {
  func: T;
  delay: number;
};

const useDebounce = <T extends (...args: any[]) => void>({
  func,
  delay,
}: UseDebounceProps<T>) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  );

  return debouncedFn;
};

export default useDebounce;
