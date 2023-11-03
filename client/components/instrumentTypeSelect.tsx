import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import { instrumentTypes } from "@/lib/constants";

interface InstrumentTypeSelectProps {
  selectedInstruments: string[];
  setSelectedInstruments: (instruments: string[]) => void;
}

const InstrumentTypeSelect = ({
  selectedInstruments,
  setSelectedInstruments,
}: InstrumentTypeSelectProps) => {
  return (
    <FormControl color="primary" sx={{ m: 1, width: 300 }}>
      <InputLabel id="instrumentTypeSelect">
        Desired Instrument Types
      </InputLabel>
      <Select
        labelId="instrumentTypeSelect"
        label="Desired Instrument Types"
        name="instruments"
        multiple
        value={selectedInstruments}
        onChange={(e) => setSelectedInstruments(e.target.value as string[])}
        input={
          <OutlinedInput
            id="select-multiple-chip"
            label="Select Desired Instruments"
          />
        }
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value: string) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
      >
        {instrumentTypes.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default InstrumentTypeSelect;
