import React from "react";
const ICON_URL = "/996dca15-8465-4ed0-b62f-a59c3ab23287.jpg";
interface AiIconProps {
  size?: number;
  className?: string;
}

/** 3D interconnected-loop AI Assistant mark. The black source background is removed with a screen blend. */
export function AiIcon({
  size = 32,
  className = ""
}: AiIconProps) {
  return <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden ${className}`} style={{
    width: size,
    height: size
  }} aria-hidden>
      <img src={ICON_URL} alt="" className="h-full w-full scale-[1.55] object-cover mix-blend-screen" draggable={false} />
    </span>;
}