import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import styles from "@/styles/components/projectCard.module.scss";
import { useEffect, useState } from "react";
import { populatePlayers, startAudio, stopAudio } from "@/utils/playbackUtils";
import * as Tone from "tone";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
  highlightedInstruments: string[];
}

const ProjectCard = ({ project, highlightedInstruments }: ProjectCardProps) => {
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (project.projectid === undefined) return;
    populatePlayers(project.projectid, setTrackList, setPlayers);
  }, [project.projectid]);

  return (
    <Card className={styles.projectCard}>
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2}>
              <Link
                className={styles.titleLink}
                href={`/project/${project.projectid}`}
              >
                <Typography
                  className={styles.title}
                  variant="h5"
                  component="div"
                >
                  {project.projectname}
                </Typography>
              </Link>
              {project.lookingfor?.map((instrument) => (
                <Chip
                  key={instrument}
                  color={
                    highlightedInstruments.includes(instrument)
                      ? "primary"
                      : "default"
                  }
                  label={instrument}
                  // className={styles.instrumentChip}
                />
              ))}
            </Stack>
            <Typography variant="body2">{project.username}</Typography>
            <Typography variant="body2">{project.description}</Typography>
          </Stack>
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
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
