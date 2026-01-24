import { useState, useRef, useEffect } from 'react';

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Auto-play the video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch((e) => {
        // If autoplay fails (e.g., browser policy), skip to dashboard
        console.warn('Video autoplay failed:', e);
        onComplete();
      });
    }
  }, [onComplete]);

  const handleVideoEnd = () => {
    // Start fade out, then complete
    setFadeOut(true);
    setTimeout(onComplete, 500);
  };

  const handleVideoError = () => {
    // If video fails to load, skip to dashboard
    console.warn('Video failed to load');
    onComplete();
  };

  return (
    <div
      className={`widget-container bg-f1-bg-primary flex items-center justify-center rounded-xl overflow-hidden transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/f1.mp4"
        muted
        playsInline
        onEnded={handleVideoEnd}
        onError={handleVideoError}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
