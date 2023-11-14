import { LinearProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { start } from "repl";
import * as Tone from "tone";

interface TrackProgressBarProps {
  player: Tone.Player | null;
}

const TrackProgressBar = ({ player }: TrackProgressBarProps) => {
  const startTime = useRef<number | undefined>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>();
  const trackDuration = useRef<number | undefined>();

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
    }
    trackDuration.current = player?.buffer.duration;
  }, [player?.state]);

  return (
    <div style={{ minWidth: "500px" }}>
      {elapsedTime && trackDuration.current && (
        <LinearProgress
          variant="determinate"
          value={elapsedTime / 10 / trackDuration.current}
        />
      )}
    </div>
  );
};

export default TrackProgressBar;
