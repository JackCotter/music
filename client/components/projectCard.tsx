import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import styles from "@/styles/components/projectCard.module.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getMaxLengthAcceptedPlayer,
  populatePlayers,
  startAudio,
  stopAudio,
} from "@/utils/playbackUtils";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import { maxNCharacters } from "@/utils/stringUtils";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useRouter } from "next/router";
import { useAudioContext } from "@/contexts/audioContext";
import PersistentAudioSource from "@/lib/PersistantAudioSource";
import usePlayback from "@/lib/playbackHooks";
import { getTrackList } from "@/utils/apiUtils";

interface ProjectCardProps {
  project: Project;
  highlightedInstruments?: string[];
  setHighlightedInstruments?: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProjectCard = ({
  project,
  highlightedInstruments,
  setHighlightedInstruments,
}: ProjectCardProps) => {
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [players, setPlayers] = useState<PersistentAudioSource[] | null>(null);
  const projectid = useRef<number | undefined>(undefined);
  const router = useRouter();
  const { audioContext } = useAudioContext();
  const { isPlaying, setIsPlaying, duration, setDuration } = usePlayback();
  const maxLengthAcceptedPlayer = useMemo(() => {
    return getMaxLengthAcceptedPlayer(players, trackList);
  }, [players, trackList]);

  const onInstrumentClick = (instrument: string) => {
    if (
      highlightedInstruments === undefined ||
      setHighlightedInstruments === undefined
    )
      return;
    if (highlightedInstruments.includes(instrument)) {
      setHighlightedInstruments(
        highlightedInstruments.filter((i) => i !== instrument)
      );
    } else {
      setHighlightedInstruments([...highlightedInstruments, instrument]);
    }
  };

  const handleCardClick = (e: any) => {
    if (
      e.target.classList.value.includes("MuiChip") ||
      e.target.classList.value.includes("MuiSvgIcon")
    ) {
      return;
    } else if (e.target.classList.value.includes("usernameText")) {
      router.push(`/user/${project.username}`);
    } else {
      router.push(`/project/${project.projectid}`);
    }
  };

  const trackListGetQuery = async (id: number) => {
    try {
      const trackList: Track[] = await getTrackList(id);
      setTrackList(trackList);
      populatePlayers(id, audioContext, trackList, setPlayers);
    } catch {}
  };

  useEffect(() => {
    if (project.projectid === undefined) return;
    if (projectid.current === project.projectid) return;
    projectid.current = project.projectid;
    trackListGetQuery(project.projectid);
  }, [project.projectid]);

  useEffect(() => {
    if (maxLengthAcceptedPlayer?.duration) {
      setDuration(maxLengthAcceptedPlayer?.duration);
    }
  }, [maxLengthAcceptedPlayer]);

  return (
    <Card className={styles.projectCard} onClick={(d) => handleCardClick(d)}>
      <CardContent>
        <Stack direction="column">
          <Stack className={styles.topRow} direction="row" spacing={2}>
            <Typography className={styles.title} variant="h5" component="div">
              {project.projectname}
            </Typography>
            <Stack
              className={styles.usernameAndPlayButton}
              direction="row"
              spacing={1}
            >
              <div className={styles.usernameContainer}>
                <Typography className={styles.usernameText} variant="body2">
                  {project.username}
                </Typography>
              </div>
              {duration > 0 && (
                <div>
                  <IconButton
                    color="secondary"
                    className={styles.playButton}
                    onClick={() =>
                      isPlaying
                        ? stopAudio(players, setIsPlaying)
                        : startAudio(
                            players,
                            trackList,
                            setIsPlaying,
                            audioContext
                          )
                    }
                  >
                    {isPlaying ? (
                      <StopIcon className={styles.stopIcon} />
                    ) : (
                      <PlayArrowIcon className={styles.playIcon} />
                    )}
                  </IconButton>
                </div>
              )}
            </Stack>
          </Stack>
          {project.lookingfor && project.lookingfor.length > 0 && (
            <Stack className={styles.instrumentRow} direction="row" spacing={1}>
              <div className={styles.instruments}>
                <Stack direction="row" spacing={1}>
                  {project.lookingfor?.map((instrument) => (
                    <Chip
                      key={instrument}
                      color={
                        highlightedInstruments === undefined ||
                        highlightedInstruments.includes(instrument)
                          ? "primary"
                          : "default"
                      }
                      onClick={() => onInstrumentClick(instrument)}
                      label={instrument}
                    />
                  ))}
                </Stack>
              </div>
              <Tooltip
                placement="top"
                title={
                  project.lookingforstrict
                    ? "The project creator has enabled strict mode. Only the selected instruments can be contributed."
                    : "The project creator has not enabled strict mode. Any instrument can be contributed."
                }
              >
                {project.lookingforstrict ? <LockIcon /> : <LockOpenIcon />}
              </Tooltip>
            </Stack>
          )}
          <Typography variant="body2">
            {maxNCharacters(project.description, 300)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
