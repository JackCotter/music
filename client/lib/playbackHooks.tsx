import { useEffect, useRef, useState } from "react";

const usePlayback = () => {
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && duration > 0) {
      //If track is playing, change isPlaying var to false on end of track
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, duration * 1000);
      playingTimer.current = timer;
    } else if (!isPlaying && playingTimer.current) {
      clearTimeout(playingTimer.current);
      playingTimer.current = null;
    }

    return () => {
      if (playingTimer.current) {
        clearTimeout(playingTimer.current);
        playingTimer.current = null;
      }
    };
  }, [isPlaying]);

  return { duration, setDuration, isPlaying, setIsPlaying };
};

export default usePlayback;
