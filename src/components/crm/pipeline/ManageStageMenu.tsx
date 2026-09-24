'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
interface ManageStageMenuProps {
  stageLabel: string;
  isOrgOwnedStage: boolean;
  canManage: boolean;
  onEditColor: () => void;
  onEditStage: () => void;
  onDelete: () => void;
}

export default function ManageStageMenu({
  stageLabel,
  isOrgOwnedStage,
  canManage,
  onEditColor,
  onEditStage,
  onDelete,
}: ManageStageMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  if (!canManage) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label={`Manage ${stageLabel} stage`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className="opacity-70 transition-opacity hover:opacity-100"
      >
        <MoreHorizOutlinedIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onEditColor();
          }}
        >
          <ListItemIcon>
            <PaletteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change color</ListItemText>
        </MenuItem>
        {isOrgOwnedStage ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onEditStage();
            }}
          >
            <ListItemIcon>
              <EditOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit stage</ListItemText>
          </MenuItem>
        ) : null}
        {isOrgOwnedStage ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete stage</ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}
