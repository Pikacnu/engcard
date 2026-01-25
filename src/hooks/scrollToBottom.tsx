import { useState, useEffect } from 'react';

export function useScrollToBottom(
  ref: React.RefObject<HTMLDivElement | null>,
  dependencies: unknown[] = [],
) {
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (ref.current) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } =
          ref.current as HTMLDivElement;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
        setIsAtBottom(atBottom);
      };

      const currentRef = ref.current;
      currentRef.addEventListener('scroll', handleScroll);

      return () => {
        currentRef.removeEventListener('scroll', handleScroll);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...dependencies]);

  // Auto-scroll when dependencies change and user is at bottom
  useEffect(() => {
    if (ref.current && isAtBottom) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollTop = ref.current.scrollHeight;
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies]);

  return isAtBottom;
}
