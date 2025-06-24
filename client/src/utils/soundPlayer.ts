import { soundMap } from "../constants/sound-map";

type SoundType = keyof typeof soundMap;

export const playSound = (
  type: SoundType,
  options?: { volume?: number; onlyIfFocused?: boolean; disabled?: boolean }
) => {
  const { volume = 1, onlyIfFocused = true, disabled = false } = options || {};
  if (disabled) return;
  if (onlyIfFocused && !document.hasFocus()) return;

  const src = soundMap[type];
  if (!src) return;
  console.log(src);
  const audio = new Audio(src);
  audio.volume = volume; // optional
  audio.play().catch((err) => {
    console.warn("Sound play failed:", err);
  });
};
