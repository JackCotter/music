import { getProject, patchTrack } from "@/utils/apiUtils";
import {
  Button,
  IconButton,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useRouter } from "next/router";
import styles from "@/styles/pages/project.module.scss";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { populatePlayers, startAudio, stopAudio } from "@/utils/playbackUtils";
import CommitTrackModal from "@/components/modals/commitTrackModal";
import { TrackTable } from "@/components/trackTable";
import { useAuthContext } from "@/contexts/authContext";

const Project = () => {
  Tone.Transport.debug = true;
  const [players, setPlayers] = useState<Tone.Players | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const recordingIndex = useRef<number>(0);
  const [recordedData, setRecordedData] = useState<Blob | null>(null);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [projectInfo, setProjectInfo] = useState<Project | null>(null);
  const [openCommitTrackModal, setOpenCommitTrackModal] =
    useState<boolean>(false);

  const router = useRouter();
  const { projectId } = router.query;
  const { isAuthenticated } = useAuthContext();

  const projectGetQuery = async (id: number) => {
    const project: Project = await getProject(id);
    setProjectInfo(project);
  };

  useEffect(() => {
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      console.log("projectId: " + projectId);
      projectGetQuery(parseInt(projectId) as number);
    } else {
      console.log("Error: projectId is not a string");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      projectGetQuery(parseInt(projectId) as number);
      populatePlayers(parseInt(projectId) as number, setTrackList, setPlayers);
    } else {
      console.log("Error: projectId is not a string");
    }
    return () => {
      if (players) {
        console.log("disposed");
        players.dispose(); // Clean up the player
      }
    };
  }, [projectId]);

  const closeModalAndRefesh = () => {
    setOpenCommitTrackModal(false);
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      projectGetQuery(parseInt(projectId) as number);
      populatePlayers(parseInt(projectId) as number, setTrackList, setPlayers);
    } else {
      console.log("Error: projectId is not a string");
    }
  };

  const startRecording = () => {
    Tone.start();
    let recorder: MediaRecorder;
    navigator.mediaDevices
      .getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      .then((stream) => {
        recorder = new MediaRecorder(stream);
        setRecorder(recorder);
        recorder.start();
        startAudio(
          players,
          trackList,
          setIsAudioPlaying,
          recordingIndex.current
        );
      });
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      recorder.ondataavailable = (e) => {
        const url = URL.createObjectURL(e.data);
        players?.add("Recording" + recordingIndex.current++, url);
        setRecordedData(e.data);
      };
      setRecorder(null);
      stopAudio(players, setIsAudioPlaying);
    }
  };

  const saveTrackList = async () => {
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      let selectedTrackIdList: number[] = [];
      let unselectedTrackIdList: number[] = [];
      trackList.forEach((track) => {
        if (track.accepted) {
          selectedTrackIdList.push(track.trackId);
        } else {
          unselectedTrackIdList.push(track.trackId);
        }
      });
      console.log(selectedTrackIdList);
      console.log(unselectedTrackIdList);
      await patchTrack(
        selectedTrackIdList,
        parseInt(projectId) as number,
        true
      );
      await patchTrack(
        unselectedTrackIdList,
        parseInt(projectId) as number,
        false
      );
    } else {
      console.log("Error: projectId is not a string");
    }
  };

  return (
    <div className={styles.container}>
      <Stack className={styles.innerContainer} direction="column" spacing={2}>
        <Typography variant="h1">
          {projectInfo?.projectname ? projectInfo.projectname : "Track Project"}
        </Typography>
        <Typography variant="h2">
          By {projectInfo?.username ? projectInfo.username : "A User"}
        </Typography>
        <Stack direction="row" spacing={2}>
          <IconButton
            color="secondary"
            onClick={() =>
              isAudioPlaying
                ? stopAudio(players, setIsAudioPlaying)
                : startAudio(
                    players,
                    trackList,
                    setIsAudioPlaying,
                    recordingIndex.current
                  )
            }
          >
            {isAudioPlaying ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={() => (recorder ? stopRecording() : startRecording())}
          >
            {recorder ? <StopIcon /> : <FiberManualRecordIcon />}
          </IconButton>
          {isAuthenticated && (
            <Button
              variant="contained"
              onClick={() => setOpenCommitTrackModal(true)}
            >
              Commit Track
            </Button>
          )}
        </Stack>
        <div className={styles.acceptedTracksContainer}>
          <Typography variant="h3" className={styles.lightText}>
            Accepted Tracks
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Instrument</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trackList.some((track) => track.accepted) ? (
                trackList.map(
                  (track, index) =>
                    track.accepted && (
                      <TableRow key={index}>
                        <TableCell>{track.title}</TableCell>
                        <TableCell>{track.description}</TableCell>
                        <TableCell>{track.instrumentType}</TableCell>
                      </TableRow>
                    )
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    {projectInfo && projectInfo.isowner
                      ? "No tracks have been accepted. Select some from the options below!"
                      : "No tracks have been accepted. Check back later!"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {projectInfo && projectInfo.isowner && (
          <TrackTable trackList={trackList} setTrackList={setTrackList} />
        )}
        <Button
          className={styles.saveChangesButton}
          onClick={saveTrackList}
          variant="contained"
        >
          Save Changes
        </Button>
      </Stack>
      <CommitTrackModal
        isOpen={openCommitTrackModal}
        onClose={() => setOpenCommitTrackModal(false)}
        onSuccess={() => closeModalAndRefesh()}
        recordedData={recordedData}
        projectId={projectId}
      />
    </div>
  );
};

export default Project;
