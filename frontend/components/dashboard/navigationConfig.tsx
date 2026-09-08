import React from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';

import { DashboardRole } from './types';

export interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  badge?: string;
  roles: DashboardRole[];
}

// 1. Primary Section (Records, Discovery & Core Operations)
export const MAIN_NAV_ITEMS: NavItem[] = [
  // Shared
  { text: 'Dashboard', icon: <HomeRoundedIcon fontSize="small" />, path: '/dashboard', roles: ['staff', 'admin', 'developer'] },
  
  // Staff Focus
  { text: 'Smart Search', icon: <SearchRoundedIcon fontSize="small" />, path: '/search', roles: ['staff'] },
  { text: 'AI Assistant', icon: <AutoAwesomeOutlinedIcon fontSize="small" />, path: '/chat', badge: 'AI', roles: ['staff', 'admin'] },
  { text: 'Document Archive', icon: <FolderOutlinedIcon fontSize="small" />, path: '/documents', roles: ['staff', 'admin', 'developer'] },
  { text: 'Physical Locator', icon: <PlaceOutlinedIcon fontSize="small" />, path: '/locator', roles: ['staff', 'admin'] },

  // Admin Management
  { text: 'Document Approvals', icon: <FactCheckOutlinedIcon fontSize="small" />, path: '/admin/approvals', badge: '3', roles: ['admin'] },
  { text: 'User Management', icon: <PeopleAltOutlinedIcon fontSize="small" />, path: '/admin/users', roles: ['admin'] },
  { text: 'Audit & Compliance', icon: <SecurityOutlinedIcon fontSize="small" />, path: '/admin/audit', roles: ['admin'] },
  { text: 'Usage Analytics', icon: <InsightsOutlinedIcon fontSize="small" />, path: '/admin/analytics', roles: ['admin'] },

  // Developer & System Engineering
  { text: 'OCR & Task Pipeline', icon: <MemoryOutlinedIcon fontSize="small" />, path: '/developer/tasks', roles: ['developer'] },
  { text: 'Vector & DB Health', icon: <StorageOutlinedIcon fontSize="small" />, path: '/developer/database', roles: ['developer'] },
  { text: 'System Logs & Traces', icon: <TerminalOutlinedIcon fontSize="small" />, path: '/developer/logs', roles: ['developer'] },
];

// 2. Secondary Section (Personal Workspace / Tools)
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  // Staff Workspace
  { text: 'My Uploads', icon: <FileUploadOutlinedIcon fontSize="small" />, path: '/uploads', roles: ['staff'] },
  { text: 'Saved Directives', icon: <BookmarkBorderRoundedIcon fontSize="small" />, path: '/bookmarks', roles: ['staff'] },
  { text: 'Search Guide', icon: <HelpOutlineRoundedIcon fontSize="small" />, path: '/help', roles: ['staff', 'admin'] },

  // Admin / Dev Workspace
  { text: 'System Config', icon: <TerminalOutlinedIcon fontSize="small" />, path: '/settings/system', roles: ['admin', 'developer'] },
];
