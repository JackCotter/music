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
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export const TrackTable = ({ trackList }: { trackList: Track[] }) => {
  const [drawerOpen, setDrawerOpen] = useState<string>("");
  const tracksByInstrument = useRef<{ [instrumentType: string]: Track[] }>({});
  const [instrumentsUsed, setInstrumentsUsed] = useState<string[]>([]);

  useEffect(() => {
    console.log("tracklist: ", trackList);
    if (trackList && trackList.length > 0) {
      trackList.forEach((track) => {
        if (tracksByInstrument.current[track.instrumentType] === undefined) {
          tracksByInstrument.current[track.instrumentType] = [];
          if (!instrumentsUsed.includes(track.instrumentType)) {
            setInstrumentsUsed((instrumentsUsed) => [
              ...instrumentsUsed,
              track.instrumentType,
            ]);
          }
        }
        tracksByInstrument.current[track.instrumentType].push(track);
      });
      console.log(tracksByInstrument.current);
    }
  }, [trackList]);

  const openDrawer = (instrument: string) => {
    if (drawerOpen === instrument) {
      setDrawerOpen("");
      return;
    }
    setDrawerOpen(instrument);
  };

  return (
    <>
      <TableContainer>
        <Table>
          <TableBody>
            {instrumentsUsed.map((instrument, index) => (
              <TableRow key={index}>
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
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
                          <TableCell>ID</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell>Instrument</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {tracksByInstrument.current[instrument].map(
                          (track, index) => (
                            <TableRow key={index}>
                              <TableCell>{index}</TableCell>
                              <TableCell>{track.title}</TableCell>
                              <TableCell>{track.description}</TableCell>
                              <TableCell>{track.instrumentType}</TableCell>
                            </TableRow>
                          )
                        )}
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
