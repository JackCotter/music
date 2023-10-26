import { getTrackList, createTrack } from "@/utils/apiUtils";
import { Button, IconButton, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useMutation } from "react-query";
import LoginModal from "../../components/modals/loginModal";
import { useRouter } from "next/router";
import styles from "@/styles/project.module.scss";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

const Project = () => {
  Tone.Transport.debug = true;
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const recordingIndex = useRef<number>(0);
  const [recordedData, setRecordedData] = useState<Blob | null>(null);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    const trackListQuery = async (id: number) => {
      let playerDict: { [key: string]: string } = {};
      const trackList: Track[] = await getTrackList(id);
      setTrackList(trackList);
      console.log(trackList);
      trackList.forEach((track, index) => {
        playerDict[
          index.toString()
        ] = `data:audio/mpeg;base64,${track.blobData}`;
      });
      const players: Tone.Players = new Tone.Players(playerDict, () =>
        setPlayers(players)
      ).toDestination();
      setPlayers(players);
    };
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      trackListQuery(parseInt(projectId) as number);
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

  const startAudio = () => {
    if (players && players.loaded) {
      for (let i = 0; i < trackList.length || i < recordingIndex.current; i++) {
        if (players.has(i.toString())) {
          players.player(i.toString()).start(i.toString());
        }
        if (players.has("Recording" + i)) {
          players.player("Recording" + i).start();
        }
      }
    } else {
      console.log("not loaded" + players);
    }
  };

  const stopAudio = () => {
    if (players && players.loaded) {
      players.stopAll();
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
      startAudio();
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
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <IconButton color="secondary" onClick={() => startAudio()}>
            {players && players.state === "started" ? (
              <StopIcon />
            ) : (
              <PlayArrowIcon />
            )}
          </IconButton>
          <Button variant="contained" onClick={() => stopAudio()}>
            Stop Audio
          </Button>
          <Button variant="contained" onClick={() => startRecording()}>
            Start Recording
          </Button>
          <Button variant="contained" onClick={() => stopRecording()}>
            Stop Recording
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              trackCreateMutation();
            }}
          >
            Commit Track
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsLoginModalOpen(true);
            }}
          >
            login
          </Button>
        </Stack>
      </Stack>
      <LoginModal
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
      />
    </div>
  );
};

export default Project;
