import { Players } from "tone";
import { getTrackList } from "./apiUtils";

export const populatePlayers = async (
  id: number, 
  setTrackList: (trackList: Track[]) => void, 
  setPlayers: (players: Players) => void ) => {
  let playerDict: { [key: string]: string } = {};
  const trackList: Track[] = await getTrackList(id);
  setTrackList(trackList);
  trackList.forEach((track, index) => {
    playerDict[
      index.toString()
    ] = `data:audio/mpeg;base64,${track.blobData}`;
  });
  const players: Players = new Players(playerDict, () =>
    setPlayers(players)
  ).toDestination();
  setPlayers(players);
};

export const startAudio = (
  players: Players | null,
  trackList: Track[],
  setIsAudioPlaying: (isAudioPlaying: boolean) => void,
  recordingIndex?: number
) => {
  if (!recordingIndex) recordingIndex = 0;
  if (players && players.loaded) {
    for (let i = 0; i < trackList.length || i < recordingIndex; i++) {
      if (players.has(i.toString()) && trackList[i].accepted) {
        players.player(i.toString()).start(i.toString());
      }
      if (players.has("Recording" + i)) {
        players.player("Recording" + i).start();
      }
    }
    setIsAudioPlaying(true);
  } else {
    console.log("not loaded" + players);
  }
};

export const stopAudio = (
  players: Players | null,
  setIsAudioPlaying: (isAudioPlaying: boolean) => void
) => {
  if (players && players.loaded) {
    players.stopAll();
    setIsAudioPlaying(false);
  } else {
    console.log("not loaded");
  }
};
