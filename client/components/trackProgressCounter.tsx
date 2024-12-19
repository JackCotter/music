import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface TrackProgressBarProps {
  isPlaying: boolean;
  duration: number | undefined;
}

const TrackProgressCounter = ({
  duration,
  isPlaying,
}: TrackProgressBarProps) => {
  const startTime = useRef<number | undefined>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>();

  const startTimeCounter = (): void => {
    timerId.current = setInterval(() => {
      const currentDateTime: Date = new Date();
      if (startTime.current !== undefined) {
        setElapsedTime(currentDateTime.getTime() - startTime.current);
      }
    }, 1000);
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
    } else if (isPlaying === false) {
      stopTimeCounter();
      setElapsedTime(0);
    }
  }, [isPlaying]);

  return (
    <Typography variant="h6">
      {new Date(elapsedTime).toISOString().slice(14, 19)}/
      {duration
        ? new Date(duration * 1000).toISOString().slice(14, 19)
        : "--:--"}
    </Typography>
  );
};

export default TrackProgressCounter;
