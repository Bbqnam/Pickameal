import { type HTMLAttributes, type PointerEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface DragScrollProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const DragScroll = ({ className, children, style, ...props }: DragScrollProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const stopDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const el = wrapperRef.current;
    if (!el) return;
    el.setPointerCapture(event.pointerId);
    startX.current = event.clientX;
    scrollLeftStart.current = el.scrollLeft;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      event.preventDefault();
      const el = wrapperRef.current;
      if (!el) return;
      const delta = event.clientX - startX.current;
      el.scrollLeft = scrollLeftStart.current - delta;
    },
    [isDragging],
  );

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const handleLeave = () => stopDrag();
    el.addEventListener("pointerleave", handleLeave);
    return () => el.removeEventListener("pointerleave", handleLeave);
  }, [stopDrag]);

  return (
    <div
      ref={wrapperRef}
      className={cn(className, isDragging ? "select-none" : "")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      style={{
        touchAction: "pan-y",
        cursor: isDragging ? "grabbing" : "grab",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default DragScroll;
