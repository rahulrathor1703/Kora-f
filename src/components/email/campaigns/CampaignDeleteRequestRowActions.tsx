'use client';

import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import type { CampaignDeleteRequest } from '@/lib/email/campaigns/types';

interface CampaignDeleteRequestRowActionsProps {
  request: CampaignDeleteRequest;
  canApproveDelete: boolean;
  onApprove: (request: CampaignDeleteRequest) => void;
  onReject: (request: CampaignDeleteRequest) => void;
}

export default function CampaignDeleteRequestRowActions({
  request,
  canApproveDelete,
  onApprove,
  onReject,
}: CampaignDeleteRequestRowActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const canReview = canApproveDelete && request.status === 'pending';

  if (!canReview) {
    return null;
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label="Delete request actions"
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
        onClose={closeMenu}
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            closeMenu();
            onApprove(request);
          }}
        >
          <ListItemIcon>
            <CheckOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Approve</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu();
            onReject(request);
          }}
        >
          <ListItemIcon>
            <CloseOutlinedIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Reject</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
