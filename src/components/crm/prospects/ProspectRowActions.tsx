'use client';

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import type { Prospect } from '@/lib/crm/prospects/types';

interface ProspectRowActionsProps {
  prospect: Prospect;
  canRequestDelete: boolean;
  canDirectDelete: boolean;
  hasPendingDeleteRequest: boolean;
  onRequestDelete: (prospect: Prospect) => void;
  onDirectDelete: (prospect: Prospect) => void;
}

export default function ProspectRowActions({
  prospect,
  canRequestDelete,
  canDirectDelete,
  hasPendingDeleteRequest,
  onRequestDelete,
  onDirectDelete,
}: ProspectRowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  if (!canRequestDelete && !canDirectDelete) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label="Prospect actions"
        onClick={(event) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertOutlinedIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(event) => event.stopPropagation()}
      >
        {canDirectDelete ? (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onDirectDelete(prospect);
            }}
          >
            <ListItemIcon>
              <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        ) : null}
        {canRequestDelete ? (
          <MenuItem
            disabled={hasPendingDeleteRequest}
            onClick={() => {
              setAnchorEl(null);
              onRequestDelete(prospect);
            }}
          >
            <ListItemIcon>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              {hasPendingDeleteRequest
                ? 'Delete request pending'
                : 'Request delete'}
            </ListItemText>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
}
