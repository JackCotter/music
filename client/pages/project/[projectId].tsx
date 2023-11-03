import { getTrackList, createTrack, getProject } from "@/utils/apiUtils";
import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useMutation } from "react-query";
import { useRouter } from "next/router";
import styles from "@/styles/pages/project.module.scss";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { populatePlayers, startAudio } from "@/utils/playbackUtils";

const Project = () => {
  Tone.Transport.debug = true;
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const recordingIndex = useRef<number>(0);
  const [recordedData, setRecordedData] = useState<Blob | null>(null);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<Project | null>(null);
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    const projectGetQuery = async (id: number) => {
      const project: Project = await getProject(id);
      setProjectInfo(project);
    };
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      projectGetQuery(parseInt(projectId) as number);
      populatePlayers(parseInt(projectId) as number, setTrackList, setPlayers);
    } else {
      console.log("Error: projectId is not a string");
    }
    // return () => {
    //   if (players) {
    //     console.log("disposed");
    //     players.dispose(); // Clean up the player
    //   }
    // };
  }, [projectId]);

  const stopAudio = () => {
    if (players && players.loaded) {
      players.stopAll();
      setIsAudioPlaying(false);
    } else {
      console.log("not loaded");
    }
  };

  const startRecording = () => {
    Tone.start();
    let recorder: MediaRecorder;
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      recorder = new MediaRecorder(stream);
      setRecorder(recorder);
      recorder.start();
      startAudio(players, trackList, recordingIndex.current, setIsAudioPlaying);
    });
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      recorder.ondataavailable = (e) => {
        const url = URL.createObjectURL(e.data);
        players?.add("Recording" + recordingIndex.current++, url);
        setRecordedData(e.data);
      };
      setRecorder(null);
      stopAudio();
    }
  };

  const createTracks = async () => {
    if (recordedData) {
      await createTrack(1, "cool track", "Guitar", recordedData);
    }
  };
  const { mutate: trackCreateMutation } = useMutation(createTracks, {
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  return (
    <div className={styles.container}>
      <Stack className={styles.innerContainer} direction="column" spacing={2}>
        <Typography variant="h1">
          {projectInfo ? projectInfo.projectname : "Track Project"}
        </Typography>
        <Typography variant="h2">
          By {projectInfo?.username ? projectInfo.username : "A User"}
        </Typography>
        <Stack direction="row" spacing={2}>
          <IconButton
            color="secondary"
            onClick={() =>
              isAudioPlaying
                ? stopAudio()
                : startAudio(
                    players,
                    trackList,
                    recordingIndex.current,
                    setIsAudioPlaying
                  )
            }
          >
            {isAudioPlaying ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={() => (recorder ? stopRecording() : startRecording())}
          >
            {recorder ? <StopIcon /> : <FiberManualRecordIcon />}
          </IconButton>
          <Button
            variant="contained"
            onClick={() => {
              trackCreateMutation();
            }}
          >
            Commit Track
          </Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default Project;
