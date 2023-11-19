import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  TableContainer,
  Typography,
  Checkbox,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import styles from "@/styles/components/trackTable.module.scss";

export const TrackTable = ({
  trackList,
  setTrackList,
}: {
  trackList: Track[];
  setTrackList: (trackList: Track[]) => void;
}) => {
  const [drawerOpen, setDrawerOpen] = useState<string>("");
  const [tracksByInstrument, setTracksByInstrument] = useState<{
    [instrumentType: string]: Track[];
  }>({});
  const [instrumentsUsed, setInstrumentsUsed] = useState<string[]>([]);

  useEffect(() => {
    if (trackList && trackList.length > 0) {
      const newTracksByInstrument: { [instrumentType: string]: Track[] } = {};
      const newInstrumentsUsed: string[] = [];

      trackList.forEach((track) => {
        if (!newTracksByInstrument[track.instrumentType]) {
          newTracksByInstrument[track.instrumentType] = [];
          if (!newInstrumentsUsed.includes(track.instrumentType)) {
            newInstrumentsUsed.push(track.instrumentType);
          }
        }
        const updatedTracks = [
          ...newTracksByInstrument[track.instrumentType],
          track,
        ];

        newTracksByInstrument[track.instrumentType] = updatedTracks;

        return newTracksByInstrument;
      });
      setTracksByInstrument(newTracksByInstrument);
      setInstrumentsUsed(newInstrumentsUsed);
    }
  }, [trackList]);

  const openDrawer = (instrument: string) => {
    if (drawerOpen === instrument) {
      setDrawerOpen("");
      return;
    }
    setDrawerOpen(instrument);
  };

  const toggleAcceptedUpdateTrackList = (trackId: number) => async () => {
    const newTrackList = trackList.map((track) => {
      if (track.trackId === trackId) {
        return { ...track, accepted: !track.accepted };
      }
      return track;
    });
    setTrackList(newTrackList);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableBody>
            {instrumentsUsed.map((instrument, index) => (
              <TableRow key={index}>
                <TableCell className={styles.collapseButtonCell}>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    className={styles.collapseButton}
                    onClick={() => openDrawer(instrument)}
                  >
                    {drawerOpen === instrument ? (
                      <KeyboardArrowUpIcon />
                    ) : (
                      <KeyboardArrowDownIcon />
                    )}
                  </IconButton>
                </TableCell>
                {drawerOpen !== instrument && (
                  <TableCell>{instrument}</TableCell>
                )}
                <TableCell>
                  <Collapse
                    in={drawerOpen === instrument}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Accepted</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Instrument</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tracksByInstrument[instrument].map((track, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Checkbox
                                checked={track.accepted}
                                onClick={toggleAcceptedUpdateTrackList(
                                  track.trackId
                                )}
                              />
                            </TableCell>
                            <TableCell>{track.title}</TableCell>
                            <TableCell>{track.description}</TableCell>
                            <TableCell>{track.instrumentType}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Collapse>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
