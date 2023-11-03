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
  recordingIndex: number,
  setIsAudioPlaying: (isAudioPlaying: boolean) => void
) => {
  if (players && players.loaded) {
    for (let i = 0; i < trackList.length || i < recordingIndex; i++) {
      if (players.has(i.toString())) {
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