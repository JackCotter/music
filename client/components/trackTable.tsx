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
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export const TrackTable = ({ trackList }: { trackList: Track[] }) => {
  const [open, setOpen] = useState<boolean>(false);
  const tracksByInstrument = useRef<{ [instrumentType: string]: Track[] }>({});
  const instrumentsUsed = useRef<string[]>([]);

  useEffect(() => {
    console.log("tracklist: ", trackList);
    if (trackList && trackList.length > 0) {
      trackList.forEach((track) => {
        if (tracksByInstrument.current[track.instrumentType] === undefined) {
          tracksByInstrument.current[track.instrumentType] = [];
          instrumentsUsed.current.push(track.instrumentType);
        }
        tracksByInstrument.current[track.instrumentType].push(track);
      });
      console.log(tracksByInstrument.current);
      console.log(instrumentsUsed.current);
    }
  }, [trackList]);

  return (
    <>
      <TableContainer>
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
            {trackList.map((track, index) => (
              <TableRow key={index}>
                <TableCell>{index}</TableCell>
                <TableCell>{track.title}</TableCell>
                <TableCell>{track.description}</TableCell>
                <TableCell>{track.instrumentType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
