import { LinearProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

interface TrackProgressBarProps {
  player: Tone.Player | null;
  trackStopped: () => void;
}

const TrackProgressBar = ({ player, trackStopped }: TrackProgressBarProps) => {
  const startTime = useRef<number | undefined>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>();
  const [trackDuration, setTrackDuration] = useState<number | undefined>(0);

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
      trackStopped();
    }
  };

  useEffect(() => {
    if (
      player &&
      player.state === "started" &&
      startTime.current === undefined
    ) {
      const currentDateTime: Date = new Date();
      startTime.current = currentDateTime.getTime();
      startTimeCounter();
    } else if (player && player.state === "stopped") {
      stopTimeCounter();
      setElapsedTime(0);
    }
    setTrackDuration(player?.buffer.duration);
  }, [player?.state]);

  return (
    <div>
      {trackDuration && (
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
