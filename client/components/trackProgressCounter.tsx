import PersistentAudioSource from "@/lib/PersistantAudioSource";
import { LinearProgress, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface TrackProgressBarProps {
  player: PersistentAudioSource | null;
  trackStopped: () => void;
}

const TrackProgressCounter = ({
  player,
  trackStopped,
}: TrackProgressBarProps) => {
  const startTime = useRef<number | undefined>();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerId = useRef<NodeJS.Timeout | undefined>();
  const [trackDuration, setTrackDuration] = useState<number | undefined>(
    undefined
  );

  const startTimeCounter = (): void => {
    if (player) {
      setTrackDuration(player.duration);
      timerId.current = setInterval(() => {
        const currentDateTime: Date = new Date();
        if (startTime.current !== undefined) {
          setElapsedTime(currentDateTime.getTime() - startTime.current);
        }
      }, 1000);
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
      setElapsedTime(0);
    }
  }, [player?.isPlaying]);

  return (
    <Typography variant="h6">
      {trackDuration !== undefined
        ? new Date(elapsedTime).toISOString().slice(14, 19)
        : "--:--"}
      /
      {player !== null
        ? new Date(player.duration * 1000).toISOString().slice(14, 19)
        : "--:--"}
    </Typography>
  );
};

export default TrackProgressCounter;
