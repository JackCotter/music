import { getTrackList } from "@/utils/apiUtils";
import { tupleArrayStringToArray } from "@/utils/stringUtils";
import { Button, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

const fakeQueryData = [
  "https://tonejs.github.io/audio/berklee/gong_1.mp3",
  // "https://mbardin.github.io/PDM-resources/media/sound_samples/rhythmic_effects/Bubbles.mp3",
];

const Profile = () => {
  Tone.Transport.debug = true;
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const recordingIndex = useRef<number>(0);
  const [recordedUrls, setRecordedUrls] = useState<string[]>([]); // [url1, url2, ...

  useEffect(() => {
    let playerDict: { [key: string]: string } = {};
    fakeQueryData.forEach((url, index) => {
      playerDict[index.toString()] = url;
    });
    const players: Tone.Players = new Tone.Players(playerDict, () =>
      setPlayers(players)
    ).toDestination();
    return () => {
      if (players) {
        console.log("disposed");
        players.dispose(); // Clean up the player
      }
    };
  }, []);

  useEffect(() => {
    const trackListQuery = async (id: number) => {
      const trackList = await getTrackList(id);
      tupleArrayStringToArray(trackList);
      return trackList;
    };
    trackListQuery(1);
  }, []);

  const startAudio = () => {
    if (players && players.loaded) {
      for (
        let i = 0;
        i < fakeQueryData.length || i < recordingIndex.current;
        i++
      ) {
        if (players.has(i.toString())) {
          players.player(i.toString()).start(i.toString());
        }
        if (players.has("Recording" + i)) {
          players.player("Recording" + i).start();
        }
      }
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
        setRecordedUrls([...recordedUrls, url]);
      };
      stopAudio();
    }
  };

  const commitRecordings = () => {
    

  return (
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
        <Button variant="contained" onClick={() => {}}>
          Commit Track
        </Button>
      </Stack>
    </Stack>
  );
};

export default Profile;
