import PersistentAudioSource from "@/lib/PersistantAudioSource";
import { LinearProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface TrackProgressBarProps {
  player: PersistentAudioSource | null;
  trackStopped: () => void;
}

const TrackProgressBar = ({ player, trackStopped }: TrackProgressBarProps) => {
  const startTime = useRef<number | undefined>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>();
  const [trackDuration, setTrackDuration] = useState<number | undefined>(1);

  const startTimeCounter = (): void => {
    if (player) {
      setTrackDuration(player.duration);
      timerId.current = setInterval(() => {
        const currentDateTime: Date = new Date();
        if (startTime.current !== undefined) {
          setElapsedTime(currentDateTime.getTime() - startTime.current);
        }
      }, 200);
    }
  };

  const stopTimeCounter = (): void => {
    if (timerId.current) {
      clearInterval(timerId.current);
      startTime.current = undefined;
      timerId.current = undefined;
      trackStopped();
    }
  };

  useEffect(() => {
    if (player && player.isPlaying && startTime.current === undefined) {
      const currentDateTime: Date = new Date();
      startTime.current = currentDateTime.getTime();
      startTimeCounter();
    } else if (player && player.isPlaying === false) {
      stopTimeCounter();
      const timer = setTimeout(() => {
        setElapsedTime(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [player?.isPlaying]);

  return (
    <div>
      {trackDuration !== undefined && (
        <LinearProgress
          variant="determinate"
          value={
            elapsedTime / 10 / trackDuration < 100
              ? elapsedTime / 10 / trackDuration
              : 100
          }
        />
      )}
    </div>
  );
};

export default TrackProgressBar;
