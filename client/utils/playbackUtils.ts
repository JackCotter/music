import { Player, Players } from "tone";
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
  const players: Players = new Players(playerDict).toDestination();
  setPlayers(players);
};

export const startAudio = (
  players: Players | null,
  trackList: Track[],
  setIsAudioPlaying: (isAudioPlaying: boolean) => void,
  recordingName?: string,
) => {
  if (players && players.loaded) {
    for (let i = 0; i < trackList.length; i++) {
      if (players.has(i.toString()) && trackList[i].accepted) {
        players.player(i.toString()).start(i.toString());
      }
    }
    if (recordingName && players.has(recordingName) && players.player(recordingName)?.loaded) {
        players.player(recordingName).start();
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

export const getMaxLengthAcceptedPlayer = (Players: Players | null, Tracks: Track[]): Player | null => {
  if (!Players) return null;
  let maxLength = 0;
  let maxLengthPlayer: Player | null = null
  for (let i = 0; i < Tracks.length; i++) {
    if (Players.has(i.toString()) && Tracks[i].accepted) {
      if (Players.player(i.toString()).buffer.duration > maxLength) {
        maxLengthPlayer = Players.player(i.toString());
        maxLength = Players.player(i.toString()).buffer.duration;
      }
    }
  }
  return maxLengthPlayer;
}
