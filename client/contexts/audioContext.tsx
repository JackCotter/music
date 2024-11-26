import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AudioContextType {
  audioContext: AudioContext | null;
  duration: number;
  setDuration: (duration: number) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const AudioContext = createContext<AudioContextType>({
  audioContext: null,
  duration: 0,
  setDuration: (duration: number) => {},
  isPlaying: false,
  setIsPlaying: (isPlaying: boolean) => {},
});

export const useAudioContext = () => useContext(AudioContext);

interface AudioContextProviderProps {
  children: React.ReactNode;
}

export const AudioContextProvider = ({
  children,
}: AudioContextProviderProps) => {
  const audioContext = useRef<AudioContext | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioContext.current = new window.AudioContext();
  }, []);

  useEffect(() => {
    if (isPlaying && duration) {
      //If track is playing, change isPlaying var to false on end of track
      const timer = setTimeout(() => {
        setIsPlaying(false);
      }, duration * 1000);
      playingTimer.current = timer;
    } else if (!isPlaying && playingTimer.current) {
      clearTimeout(playingTimer.current);
      playingTimer.current = null;
    }
  }, [isPlaying]);

  return (
    <AudioContext.Provider
      value={{
        audioContext: audioContext.current,
        duration: duration,
        setDuration: setDuration,
        isPlaying: isPlaying,
        setIsPlaying: setIsPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
