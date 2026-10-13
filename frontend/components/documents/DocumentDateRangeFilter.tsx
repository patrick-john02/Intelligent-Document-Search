"use client";

import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

interface DocumentDateRangeFilterProps {
  fromDate: Dayjs | null;
  toDate: Dayjs | null;
  onFromDateChange: (date: Dayjs | null) => void;
  onToDateChange: (date: Dayjs | null) => void;
  onClear: () => void;
}

export default function DocumentDateRangeFilter({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
}: DocumentDateRangeFilterProps) {
  const hasActiveDate = Boolean(fromDate || toDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          alignItems: "center",
          bgcolor: (theme) =>
            hasActiveDate
              ? theme.palette.mode === "dark"
                ? "rgba(59, 130, 246, 0.12)"
                : "rgba(59, 130, 246, 0.06)"
              : "transparent",
          px: hasActiveDate ? 0.75 : 0,
          py: hasActiveDate ? 0.25 : 0,
          borderRadius: 1,
          border: hasActiveDate ? "1px solid" : "none",
          borderColor: hasActiveDate ? "primary.light" : "transparent",
          transition: "all 0.15s ease",
        }}
      >
        <Tooltip title="Filter files by date range (From - To)">
          <CalendarTodayRoundedIcon
            sx={{
              fontSize: 16,
              color: hasActiveDate ? "primary.main" : "text.secondary",
              display: { xs: "none", sm: "block" },
              ml: hasActiveDate ? 0.25 : 0,
            }}
          />
        </Tooltip>

        {/* From Date */}
        <DatePicker
          label="From"
          value={fromDate}
          onChange={onFromDateChange}
          format="YYYY-MM-DD"
          slotProps={{
            textField: {
              size: "small",
              sx: {
                width: { xs: 125, sm: 135 },
                "& .MuiOutlinedInput-root": {
                  height: 34,
                  fontSize: "0.8rem",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.78rem",
                  top: -6,
                },
                "& .MuiInputLabel-shrink": {
                  top: 0,
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 16,
                },
              },
            },
            field: {
              clearable: true,
            },
          }}
        />

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            fontSize: "0.76rem",
            px: 0.25,
          }}
        >
          to
        </Typography>

        {/* To Date */}
        <DatePicker
          label="To"
          value={toDate}
          onChange={onToDateChange}
          format="YYYY-MM-DD"
          minDate={fromDate || undefined}
          slotProps={{
            textField: {
              size: "small",
              sx: {
                width: { xs: 125, sm: 135 },
                "& .MuiOutlinedInput-root": {
                  height: 34,
                  fontSize: "0.8rem",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "0.78rem",
                  top: -6,
                },
                "& .MuiInputLabel-shrink": {
                  top: 0,
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 16,
                },
              },
            },
            field: {
              clearable: true,
            },
          }}
        />

        {hasActiveDate && (
          <Tooltip title="Clear date filter">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{
                p: 0.4,
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <ClearRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </LocalizationProvider>
  );
}
