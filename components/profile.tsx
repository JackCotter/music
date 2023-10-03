import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import * as Tone from "tone";

const fakeQueryData = [
  "https://tonejs.github.io/audio/berklee/gong_1.mp3",
  "https://mbardin.github.io/PDM-resources/media/sound_samples/rhythmic_effects/Bubbles.mp3",
];

const Profile = () => {
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  // const [transport, setTransport] = useState<Tone.Transport | null>(null);
  useEffect(() => {
    let playerDict: { [key: string]: string } = {};
    fakeQueryData.forEach((url, index) => {
      playerDict[index.toString()] = url;
    });
    const player: Tone.Players = new Tone.Players(playerDict, () =>
      setPlayers(player)
    ).toDestination();
    // play as soon as the buffer is loaded
    // player.autostart = false;
    return () => {
      if (player) {
        console.log("disposed");
        // player.dispose(); // Clean up the player
      }
    };
  }, []);

  const startAudio = () => {
    if (players && players.loaded) {
      for (let i = 0; i < fakeQueryData.length; i++) {
        players.player(i.toString()).start(i.toString());
      }
    }
  };

  const stopAudio = () => {
    if (players && players.loaded) {
      players.stopAll();
      // players.sto?p("+1");
    } else {
      console.log("not loaded");
    }
  };

  return (
    <>
      <Button variant="contained" onClick={() => startAudio()}>
        Start Audio
      </Button>
      <Button variant="contained" onClick={() => stopAudio()}>
        Stop Audio
      </Button>
    </>
  );
};

export default Profile;
