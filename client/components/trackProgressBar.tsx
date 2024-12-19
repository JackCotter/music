import { LinearProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface TrackProgressBarProps {
  isPlaying: boolean;
  duration: number;
}

const TrackProgressBar = ({ isPlaying, duration }: TrackProgressBarProps) => {
  const startTime = useRef<number | undefined>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>();

  const startTimeCounter = (): void => {
    if (duration) {
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
    }
  };

  useEffect(() => {
    if (isPlaying) {
      const currentDateTime: Date = new Date();
      startTime.current = currentDateTime.getTime();
      startTimeCounter();
    } else if (!isPlaying) {
      stopTimeCounter();
      const timer = setTimeout(() => {
        setElapsedTime(0);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  return (
    <div>
      {duration !== undefined && (
        <LinearProgress
          variant="determinate"
          value={
            elapsedTime / 10 / duration < 100
              ? elapsedTime / 10 / duration
              : 100
          }
        />
      )}
    </div>
  );
};

export default TrackProgressBar;
