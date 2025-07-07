import React, { useEffect, useRef, useState } from "react";

type CustomSliderProps = {
  duration: number;
  currentTime: number;
  onSeek: (number: number) => void;
};

 export const CustomSlider = ({
  duration = 0,
  currentTime = 0,
  onSeek,
}: CustomSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(currentTime);

  const sliderRef = useRef<HTMLInputElement>(null);

  const progress =
    ((isDragging ? dragValue : currentTime) / duration) * 100 || 0;

  // Animate when dragging
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setDragValue(newTime);
    onSeek(newTime);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => {
    setIsDragging(false);
    onSeek(dragValue);
  };

  useEffect(() => {
    if (!isDragging) setDragValue(currentTime);
  }, [currentTime, isDragging]);

  return (
    <input
      ref={sliderRef}
      type="range"
      step="0.01"
      min="0"
      max={duration}
      value={isDragging ? dragValue : currentTime}
      onChange={handleSliderChange}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="w-full h-1 appearance-none bg-gray-300 rounded-lg transition-all duration-300 ease-in-out cursor-pointer custom_range"
      style={{
        background: `linear-gradient(to right, #a294f9 ${progress}%, #e5e7eb ${progress}%)`,
      }}
    />
  );
};
