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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/pages/project.module.scss";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getMaxLengthAcceptedPlayer,
  populatePlayers,
  startAudio,
  stopAudio,
} from "@/utils/playbackUtils";
import CommitTrackModal from "@/components/modals/commitTrackModal";
import { TrackTable } from "@/components/trackTable";
import { useAuthContext } from "@/contexts/authContext";
import { useMutation } from "react-query";
import { maxNCharacters } from "@/utils/stringUtils";
import TrackProgressBar from "@/components/trackProgressBar";
import Link from "next/link";
import TrackProgressCounter from "@/components/trackProgressCounter";
import PersistentAudioSource from "@/lib/PersistantAudioSource";
import { useAudioContext } from "@/contexts/audioContext";
import usePlayback from "@/lib/playbackHooks";

const Project = () => {
  const [players, setPlayers] = useState<PersistentAudioSource[] | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recordedData, setRecordedData] = useState<Blob | null>(null);
  const [trackList, setTrackList] = useState<Track[]>([]);
  const [projectInfo, setProjectInfo] = useState<Project | null>(null);
  const [openCommitTrackModal, setOpenCommitTrackModal] =
    useState<boolean>(false);
  const { audioContext } = useAudioContext();
  const { duration, setDuration, isPlaying, setIsPlaying } = usePlayback();

  const router = useRouter();
  const { projectId } = router.query;
  const { isAuthenticated } = useAuthContext();
  const maxLengthAcceptedPlayer = useMemo(() => {
    return getMaxLengthAcceptedPlayer(players, trackList);
  }, [players, trackList]);

  const projectGetQuery = async (id: number) => {
    const project: Project = await getProject(id);
    setProjectInfo(project);
  };

  useEffect(() => {
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      projectGetQuery(parseInt(projectId) as number);
    } else {
      console.log("Error: projectId is not a string");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      projectGetQuery(parseInt(projectId) as number);
      populatePlayers(
        parseInt(projectId) as number,
        audioContext,
        setTrackList,
        setPlayers
      );
    } else {
      console.log("Error: projectId is not a string");
    }
    return () => {
      if (players) {
        players.forEach((player) => {
          player.stop();
          player.disconnect();
        }); // Clean up the player
      }
    };
  }, [projectId]);

  useEffect(() => {
    if (maxLengthAcceptedPlayer) {
      setDuration(maxLengthAcceptedPlayer.duration);
    }
  }, [maxLengthAcceptedPlayer]);

  useEffect(() => {
    if (!isPlaying && recorder) {
      stopRecording();
    }
  }, [isPlaying]);

  const closeModalAndRefesh = () => {
    setOpenCommitTrackModal(false);
    deleteRecording();
    if (projectId === undefined) return;
    if (typeof projectId === "string") {
      projectGetQuery(parseInt(projectId) as number);
      populatePlayers(
        parseInt(projectId) as number,
        audioContext,
        setTrackList,
        setPlayers
      );
    } else {
      console.log("Error: projectId is not a string");
    }
  };

  const startRecording = () => {
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
        startAudio(players, trackList, setIsPlaying, audioContext);
        recorder.start();
      });
  };

  const stopRecording = async () => {
    if (recorder) {
      recorder.stop();
      recorder.ondataavailable = async (e) => {
        if (audioContext) {
          const audioBuffer = await audioContext.decodeAudioData(
            await e.data.arrayBuffer()
          );
          const audioSource = new PersistentAudioSource(
            audioContext,
            audioBuffer
          );
          players?.push(audioSource);
        }
        setRecordedData(e.data);
      };
      setRecorder(null);
      stopAudio(players, setIsPlaying);
    }
  };

  const deleteRecording = () => {
    if (recorder) {
      recorder.stop();
      setRecorder(null);
      stopAudio(players, setIsPlaying);
    }
    if (recordedData) {
      setRecordedData(null);
    }
    if (players && players.length > trackList.length) {
      players.pop();
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

  const {
    mutate: trackCreateMutation,
    isLoading,
    isSuccess,
  } = useMutation(saveTrackList, {
    onSuccess: () => {
      console.log("success");
    },
    onError: () => {
      console.log("error");
    },
  });

  return (
    <div className={styles.container}>
      <Stack className={styles.innerContainer} direction="column" spacing={2}>
        <Stack className={styles.titleRow} direction="row" spacing={6}>
          <Typography className={styles.title} variant="h1">
            {projectInfo?.projectname ? projectInfo.projectname : "Loading"}
          </Typography>
          <Link
            className={styles.username}
            href={`/user/${projectInfo?.username}`}
          >
            <Typography variant="h2">
              By {projectInfo?.username ? projectInfo.username : "Loading"}
            </Typography>
          </Link>
        </Stack>
        <Typography variant="h3">
          {projectInfo?.description
            ? maxNCharacters(projectInfo.description, 300)
            : ""}
        </Typography>
        <Stack className={styles.playButtonRow} direction="row" spacing={2}>
          <IconButton
            color="secondary"
            onClick={() =>
              isPlaying
                ? stopAudio(players, setIsPlaying)
                : startAudio(players, trackList, setIsPlaying, audioContext)
            }
          >
            {isPlaying ? <StopIcon /> : <PlayArrowIcon />}
          </IconButton>
          <IconButton
            onClick={() =>
              recordedData
                ? deleteRecording()
                : recorder
                ? deleteRecording()
                : startRecording()
            }
          >
            {recordedData ? (
              <DeleteIcon />
            ) : recorder ? (
              <CloseIcon />
            ) : (
              <FiberManualRecordIcon />
            )}
          </IconButton>
          <TrackProgressCounter isPlaying={isPlaying} duration={duration} />
          {recordedData !== null && (
            <Alert severity="success">
              {isAuthenticated
                ? "Track recorded. Click commit button to commit to project"
                : "Track recorded. Sign in to commit to this project."}
            </Alert>
          )}
          {isAuthenticated && recordedData !== null && (
            <Button
              variant="contained"
              onClick={() => setOpenCommitTrackModal(true)}
            >
              Commit Track
            </Button>
          )}
        </Stack>
        <TrackProgressBar isPlaying={isPlaying} duration={duration} />
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
                    {projectInfo && trackList.length == 0
                      ? "This project has no tracks. Record one with the record button above!"
                      : projectInfo && projectInfo.isowner
                      ? "No tracks have been accepted. Select some from the options below!"
                      : "No tracks have been accepted. Check back later!"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {projectInfo && projectInfo.isowner && trackList.length > 0 && (
          <>
            <TrackTable trackList={trackList} setTrackList={setTrackList} />
            <Stack
              className={styles.saveChangesButtonRow}
              direction="row"
              spacing={2}
            >
              <Button
                className={styles.saveChangesButton}
                onClick={() => trackCreateMutation()}
                variant="contained"
                disabled={isLoading}
              >
                Save Changes
              </Button>
              {isLoading && <CircularProgress />}
              {isSuccess && <Alert severity="success">Changes saved!</Alert>}
            </Stack>
          </>
        )}
      </Stack>
      {openCommitTrackModal && (
        <CommitTrackModal
          onClose={() => setOpenCommitTrackModal(false)}
          onSuccess={() => closeModalAndRefesh()}
          recordedData={recordedData}
          projectId={projectId}
          accepted={projectInfo?.isowner}
        />
      )}
    </div>
  );
};

export default Project;
