import { getTrackList, createTrack, login } from "@/utils/apiUtils";
import { Button, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useMutation } from "react-query";
import LoginModal from "./modals/loginModal";

const Project = () => {
  Tone.Transport.debug = true;
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const recordingIndex = useRef<number>(0);
  const [recordedData, setRecordedData] = useState<Blob | null>(null);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const trackListQuery = async (id: number) => {
      let playerDict: { [key: string]: string } = {};
      const trackList: Track[] = await getTrackList(id);
      setTrackList(trackList);
      trackList.forEach((track, index) => {
        const blob = new Blob([track.blobData], { type: "audio/mpeg" });
        const audioURL = URL.createObjectURL(blob);
        playerDict[index.toString()] = audioURL;
      });
      const players: Tone.Players = new Tone.Players(playerDict, () =>
        setPlayers(players)
      ).toDestination();
    };
    trackListQuery(1);
    // return () => {
    //   if (players) {
    //     console.log("disposed");
    //     players.dispose(); // Clean up the player
    //   }
    // };
  }, []);

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
    <>
      <Stack direction="column" spacing={2}>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => startAudio()}>
            Start Audio
          </Button>
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
    </>
  );
};

export default Project;
