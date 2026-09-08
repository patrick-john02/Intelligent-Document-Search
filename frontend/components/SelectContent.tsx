"use client";

import * as React from "react";
import MuiAvatar from "@mui/material/Avatar";
import MuiListItemAvatar from "@mui/material/ListItemAvatar";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Select, { SelectChangeEvent, selectClasses } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import FolderSpecialRoundedIcon from "@mui/icons-material/FolderSpecialRounded";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { useAuth } from "@/context/AuthContext";

const Avatar = styled(MuiAvatar)(({ theme }) => ({
  width: 32,
  height: 32,
  backgroundColor: (theme.vars || theme).palette.primary.main,
  color: (theme.vars || theme).palette.primary.contrastText,
  borderRadius: 8,
}));

const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
  marginRight: 12,
});

export default function SelectContent() {
  const { user } = useAuth();
  const defaultOffice = user?.office || "BLGF Region II";
  const [station, setStation] = React.useState("records");

  const handleChange = (event: SelectChangeEvent) => {
    setStation(event.target.value as string);
  };

  return (
    <Select
      labelId="station-select-label"
      id="station-select"
      value={station}
      onChange={handleChange}
      displayEmpty
      inputProps={{ "aria-label": "Select Department Division" }}
      fullWidth
      sx={{
        maxHeight: 56,
        width: "100%",
        borderRadius: 2,
        bgcolor: "background.paper",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "divider",
        },
        "&.MuiList-root": {
          p: "8px",
        },
        [`& .${selectClasses.select}`]: {
          display: "flex",
          alignItems: "center",
          gap: "2px",
          py: 1,
          pl: 1.25,
        },
      }}
    >
      <ListSubheader sx={{ pt: 0, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
        {defaultOffice}
      </ListSubheader>

      <MenuItem value="records">
        <ListItemAvatar>
          <Avatar variant="rounded">
            <FolderSpecialRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={user?.division || "Records & Archive"}
          secondary="Primary Station"
          primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }}
          secondaryTypographyProps={{ fontSize: "0.72rem" }}
        />
      </MenuItem>

      <MenuItem value="assessment">
        <ListItemAvatar>
          <Avatar variant="rounded" sx={{ bgcolor: "secondary.main" }}>
            <LayersRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Assessment Regulations"
          secondary="Division Repository"
          primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }}
          secondaryTypographyProps={{ fontSize: "0.72rem" }}
        />
      </MenuItem>

      <MenuItem value="treasury">
        <ListItemAvatar>
          <Avatar variant="rounded" sx={{ bgcolor: "success.main" }}>
            <AccountBalanceRoundedIcon sx={{ fontSize: "1.1rem" }} />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary="Local Treasury Operations"
          secondary="Circulars & Advisories"
          primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: 600 }}
          secondaryTypographyProps={{ fontSize: "0.72rem" }}
        />
      </MenuItem>
    </Select>
  );
}
