import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import * as Tone from "tone";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { start } from "repl";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [player, setPlayer] = useState<Tone.Player | null>(null);
  // const [transport, setTransport] = useState<Tone.Transport | null>(null);
  useEffect(() => {
    const player: Tone.Player = new Tone.Player(
      "https://tonejs.github.io/audio/berklee/gong_1.mp3",
      () => setPlayer(player)
    ).toDestination();
    // play as soon as the buffer is loaded
    player.autostart = false;
    return () => {
      if (player) {
        console.log("disposed");
        // player.dispose(); // Clean up the player
      }
    };
  }, []);

  const startAudio = () => {
    if (player && player.loaded) {
      player.start();
    }
  };

  const stopAudio = () => {
    if (player && player.loaded) {
      player.mute = true;
      // player.sto?p("+1");
    } else {
      console.log("not loaded");
    }
  };

  return (
    <>
      <Button onClick={() => startAudio()}>Start Audio</Button>
      <Button onClick={() => stopAudio()}>Stop Audio</Button>
    </>
  );
}
