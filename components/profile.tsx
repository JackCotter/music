import { Button, Slider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { start } from "repl";
import * as Tone from "tone";

const fakeQueryData = [
  "https://tonejs.github.io/audio/berklee/gong_1.mp3",
  "https://mbardin.github.io/PDM-resources/media/sound_samples/rhythmic_effects/Bubbles.mp3",
];

const Profile = () => {
  Tone.Transport.debug = true;
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

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

  const startAudio = () => {
    if (players && players.loaded) {
      for (let i = 0; i < fakeQueryData.length; i++) {
        players.player(i.toString()).start(i.toString());
      }
      if (players.has("Recording")) {
        console.log("recording");
        players.player("Recording").start();
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
        players?.add("Recording", URL.createObjectURL(e.data), () =>
          console.log(players?.player("Recording").get())
        );
      };
      console.log(players?.player("0").get());
      stopAudio();
    }
  };

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
      </Stack>
      {/* <Stack direction="column" spacing={2}>
        {fakeQueryData.map((url, index) => {
          return (
            <Stack direction="column" spacing={2}>
              <Slider
                key={index}
                value={
                  startTime && players
                    ? (players.player(index.toString()).buffer. -
                        startTime) /
                      players.player(index.toString()).buffer.duration
                    : 0
                }
              />
              <div>
                {startTime && players
                  ? players.player("1").immediate() - startTime
                  : 0}
              </div>
              <div>
                {players ? players.player(index.toString()).buffer.duration : 0}
              </div>
            </Stack>
          );
        })}
      </Stack> */}
    </Stack>
  );
};

export default Profile;
