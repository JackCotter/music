import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AudioContextType {
  audioContext: AudioContext | null;
}

const AudioContext = createContext<AudioContextType>({
  audioContext: null,
});

export const useAudioContext = () => useContext(AudioContext);

interface AudioContextProviderProps {
  children: React.ReactNode;
}

export const AudioContextProvider = ({
  children,
}: AudioContextProviderProps) => {
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    audioContext.current = new window.AudioContext();
  }, []);

  return (
    <AudioContext.Provider
      value={{
        audioContext: audioContext.current,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
