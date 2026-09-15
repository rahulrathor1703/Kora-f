'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { PROTECTED_PIPELINE_STAGE_VALUE } from '@/lib/crm/pipeline/constants';

interface ManageStageMenuProps {
  stageLabel: string;
  stageValue: string;
  canManage: boolean;
  onEditColor: () => void;
  onDelete: () => void;
}

export default function ManageStageMenu({
  stageLabel,
  stageValue,
  canManage,
  onEditColor,
  onDelete,
}: ManageStageMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const isProtected = stageValue === PROTECTED_PIPELINE_STAGE_VALUE;

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
        {!isProtected ? (
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
