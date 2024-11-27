import { getTrackList } from "./apiUtils";
import PersistentAudioSource from "@/lib/PersistantAudioSource";

function base64ToArrayBuffer(base64String: string) {
    // Step 1: Decode the base64 string into a binary string
    const binaryString = atob(base64String);

    // Step 2: Create an ArrayBuffer of the appropriate size
    const arrayBuffer = new ArrayBuffer(binaryString.length);

    // Step 3: Create a typed array (Uint8Array) view on the ArrayBuffer
    const uint8Array = new Uint8Array(arrayBuffer);

    // Step 4: Copy the binary string data into the Uint8Array
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Return the resulting ArrayBuffer
    return arrayBuffer;
}

export const populatePlayers = async (
  id: number, 
  audioContext: AudioContext | null,
  trackList: Track[], 
  setPlayers: (players: PersistentAudioSource[]) => void ) => {
  if (audioContext === null) return
  let players:PersistentAudioSource[] = []
  const playerPromises = trackList.map(async (track, index) => {
    const arrayBuffer = base64ToArrayBuffer(track.blobData);
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const audioSource = new PersistentAudioSource(audioContext, audioBuffer);
    players[index] = audioSource; // Assign audioSource to players at the correct index
  });

  await Promise.all(playerPromises)
  setPlayers([...players]);
};

export const startAudio = (
  players: PersistentAudioSource[] | null,
  trackList: Track[],
  setIsAudioPlaying: (isAudioPlaying: boolean) => void,
  audioContext: AudioContext | null
) => {
  if (audioContext && players && players.length > 0) {
    const startTime = audioContext.currentTime;
    for (let i = 0; i < trackList.length; i++) {
      if (players[i] && trackList[i].accepted) {
        players[i].start(startTime);
      }
    }
    if (players[trackList.length]) {
      players[trackList.length].start(startTime);
    }
    // if (recordingName && players.has(recordingName) && players.player(recordingName)?.loaded) {
    //     players.player(recordingName).start();
    // }
    setIsAudioPlaying(true);
  } else {
    console.log("not loaded" + players);
  }
};

export const stopAudio = (
  players: PersistentAudioSource[] | null,
  setIsAudioPlaying: (isAudioPlaying: boolean) => void
) => {
  if (players && players.length > 0) {
    players.forEach((player) => {
      try {
      player.stop();
      } catch{}
    })
    setIsAudioPlaying(false);
  } else {
    console.log("not loaded");
  }
};

export const getMaxLengthAcceptedPlayer = (Players: PersistentAudioSource[] | null, Tracks: Track[]):PersistentAudioSource | null  => {
  if (!Players) return null;
  let maxLength = 0;
  let maxLengthPlayer: PersistentAudioSource | null = null
  for (let i = 0; i < Tracks.length; i++) {
    if (Players[i] && Tracks[i].accepted) {
      if (Players[i].duration > maxLength) {
        maxLength = Players[i].duration;
        maxLengthPlayer = Players[i];
      }
    }
  }
  return maxLengthPlayer;
}
