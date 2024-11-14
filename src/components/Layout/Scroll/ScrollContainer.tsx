import { LegacyRef, RefObject, forwardRef, useRef } from "react";

import useScrollContainer from "./useScrollContainer";

function ScrollContainer(
  { children }: { children: React.ReactNode },
  ref: LegacyRef<HTMLDivElement>,
) {
  const innerRef = useRef<HTMLDivElement>(null); // 기본 ref
  const containerRef = ref || innerRef; // 전달된 ref가 없을 경우 innerRef 사용
  const { handleMouseDown, handleMouseMove, handleMouseUpOrLeave } =
    useScrollContainer(containerRef as RefObject<HTMLDivElement>);

  return (
    // eslint-disable-next-line
    <div
      className="no-scrollbar overflow-x-scroll"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUpOrLeave}
      onMouseUp={handleMouseUpOrLeave}
    >
      {children}
    </div>
  );
}

export default forwardRef(ScrollContainer);
