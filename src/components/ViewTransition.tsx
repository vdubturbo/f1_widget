import { useEffect, useState, type ReactNode } from 'react';

interface ViewTransitionProps {
  children: ReactNode;
  viewKey: string;
}

export function ViewTransition({ children, viewKey }: ViewTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(viewKey);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (viewKey !== currentKey) {
      // Start exit animation
      setIsVisible(false);

      // After exit animation, switch content and enter
      const timeout = setTimeout(() => {
        setContent(children);
        setCurrentKey(viewKey);
        setIsVisible(true);
      }, 300);

      return () => clearTimeout(timeout);
    } else {
      // Initial mount
      setIsVisible(true);
    }
  }, [viewKey, currentKey, children]);

  return (
    <div
      className={`
        transition-opacity duration-300 ease-in-out h-full
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {content}
    </div>
  );
}
