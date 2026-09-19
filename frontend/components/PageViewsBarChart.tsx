"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

const X_AXIS_DATA = [
  {
    scaleType: 'band' as const,
    categoryGapRatio: 0.5,
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    height: 24,
  },
];

const Y_AXIS_DATA = [{ width: 50 }];

const SERIES_DATA = [
  {
    id: 'page-views',
    label: 'Documents Archived',
    data: [142, 185, 160, 210, 195, 178, 178],
    stack: 'A',
  },
  {
    id: 'downloads',
    label: 'Semantic Searches',
    data: [620, 840, 715, 930, 885, 760, 820],
    stack: 'A',
  },
  {
    id: 'conversions',
    label: 'Verified Citations',
    data: [380, 520, 490, 610, 570, 480, 540],
    stack: 'A',
  },
];

const CHART_MARGIN = { left: 0, right: 0, top: 20, bottom: 0 };
const CHART_GRID = { horizontal: true };

export default function PageViewsBarChart() {
  const theme = useTheme();
  const colorPalette = React.useMemo(
    () => [
      (theme.vars || theme).palette.primary.dark,
      (theme.vars || theme).palette.primary.main,
      (theme.vars || theme).palette.primary.light,
    ],
    [theme]
  );

  return (
    <Card variant="outlined" sx={{ width: '100%', borderRadius: 2.5 }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
          Ingestion Volume & Retrieval Inquiries
        </Typography>
        <Stack sx={{ justifyContent: 'space-between', mb: 2 }}>
          <Stack
            direction="row"
            sx={{
              alignContent: { xs: 'center', sm: 'flex-start' },
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="h4" component="p" sx={{ fontWeight: 800 }}>
              14,850
            </Typography>
            <Chip size="small" color="success" label="+14.8%" sx={{ fontWeight: 700 }} />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Archived records ingested and semantic AI queries resolved over the last 6 months
          </Typography>
        </Stack>
        <BarChart
          borderRadius={8}
          colors={colorPalette}
          xAxis={X_AXIS_DATA}
          yAxis={Y_AXIS_DATA}
          series={SERIES_DATA}
          height={250}
          margin={CHART_MARGIN}
          grid={CHART_GRID}
          hideLegend
        />
      </CardContent>
    </Card>
  );
}
