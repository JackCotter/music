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
import { useEffect, useRef, useState } from "react";
import { populatePlayers, startAudio, stopAudio } from "@/utils/playbackUtils";
import * as Tone from "tone";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import Link from "next/link";
import { maxNCharacters } from "@/utils/stringUtils";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

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
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const projectid = useRef<number | undefined>(undefined);

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

  useEffect(() => {
    if (project.projectid === undefined) return;
    if (projectid.current === project.projectid) return;
    const populatePlayersQuery = async () => {
      projectid.current = project.projectid;
      await populatePlayers(project.projectid, setTrackList, setPlayers);
    };
    populatePlayersQuery();
  }, [project.projectid]);

  return (
    <Card className={styles.projectCard}>
      <CardContent>
        <Stack direction="column">
          <Stack className={styles.topRow} direction="row" spacing={2}>
            <Link
              className={styles.titleLink}
              href={`/project/${project.projectid}`}
            >
              <Typography className={styles.title} variant="h5" component="div">
                {project.projectname}
              </Typography>
            </Link>
            <Stack
              className={styles.usernameAndPlayButton}
              direction="row"
              spacing={1}
            >
              <Link
                className={styles.titleLink}
                href={`/user/${project.username}`}
              >
                <Typography className={styles.username} variant="body2">
                  {project.username}
                </Typography>
              </Link>
              <div>
                <IconButton
                  color="secondary"
                  onClick={() =>
                    isAudioPlaying
                      ? stopAudio(players, setIsAudioPlaying)
                      : startAudio(players, trackList, setIsAudioPlaying)
                  }
                >
                  {isAudioPlaying ? <StopIcon /> : <PlayArrowIcon />}
                </IconButton>
              </div>
            </Stack>
          </Stack>
          {project.lookingfor && project.lookingfor.length && (
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
