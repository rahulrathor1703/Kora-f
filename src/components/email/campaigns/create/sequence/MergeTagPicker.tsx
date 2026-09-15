'use client';

import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useState } from 'react';
import { useMergeFieldCatalog } from '@/hooks/useMergeFieldCatalog';
import type {
  MergeFieldGroup,
  MergeFieldItem,
  MergeFieldVariant,
} from '@/lib/email/campaigns/merge-field-catalog';
import { formatMergeToken } from '@/lib/email/campaigns/merge-tags';

interface MergeTagPickerProps {
  onInsert: (token: string) => void;
}

const menuPaperSx = {
  maxHeight: 240,
  width: 220,
  '& .MuiList-root': {
    maxHeight: 240,
    overflowY: 'auto',
  },
} as const;

function variantTooltip(variant: MergeFieldVariant): string {
  if (variant.listCount <= 0) {
    return variant.label;
  }

  const listLabel = variant.listCount === 1 ? 'list' : 'lists';
  return `${variant.label} · Used in ${variant.listCount} ${listLabel}`;
}

export default function MergeTagPicker({ onInsert }: MergeTagPickerProps) {
  const { catalog, isLoading } = useMergeFieldCatalog();
  const [rootAnchor, setRootAnchor] = useState<HTMLElement | null>(null);
  const [groupAnchor, setGroupAnchor] = useState<HTMLElement | null>(null);
  const [variantAnchor, setVariantAnchor] = useState<HTMLElement | null>(null);
  const [activeGroup, setActiveGroup] = useState<MergeFieldGroup | null>(null);
  const [activeItem, setActiveItem] = useState<MergeFieldItem | null>(null);

  const closeAll = useCallback(() => {
    setRootAnchor(null);
    setGroupAnchor(null);
    setVariantAnchor(null);
    setActiveGroup(null);
    setActiveItem(null);
  }, []);

  const handleInsert = useCallback(
    (token: string) => {
      onInsert(formatMergeToken(token));
      closeAll();
    },
    [closeAll, onInsert],
  );

  const handleGroupOpen = (
    event: React.MouseEvent<HTMLElement>,
    group: MergeFieldGroup,
  ) => {
    if (group.items.length === 1) {
      handleItemClick(event, group.items[0]);
      return;
    }

    setActiveGroup(group);
    setGroupAnchor(event.currentTarget);
  };

  const handleItemClick = (
    event: React.MouseEvent<HTMLElement>,
    item: MergeFieldItem,
  ) => {
    if (item.variants.length === 1) {
      handleInsert(item.variants[0].token);
      return;
    }

    setActiveItem(item);
    setVariantAnchor(event.currentTarget);
  };

  const rootOpen = Boolean(rootAnchor);
  const groupOpen = Boolean(groupAnchor);
  const variantOpen = Boolean(variantAnchor);
  const hasGroups = catalog.groups.length > 0;

  return (
    <>
      <Tooltip
        title={
          isLoading
            ? 'Loading merge tags…'
            : hasGroups
              ? 'Insert merge tag'
              : 'No list fields found'
        }
      >
        <span>
          <IconButton
            size="small"
            aria-label="Insert merge tag"
            disabled={isLoading || !hasGroups}
            onClick={(event) => setRootAnchor(event.currentTarget)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              border: '1px solid',
              borderColor:
                'color-mix(in srgb, var(--theme-primary) 22%, var(--surface-border))',
              bgcolor:
                'color-mix(in srgb, var(--theme-primary) 6%, var(--surface))',
              color: 'var(--theme-primary)',
              transition:
                'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                bgcolor:
                  'color-mix(in srgb, var(--theme-primary) 12%, var(--surface))',
                borderColor:
                  'color-mix(in srgb, var(--theme-primary) 32%, var(--surface-border))',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              },
              '&.Mui-disabled': {
                borderColor: 'divider',
                bgcolor: 'action.hover',
                color: 'text.disabled',
              },
            }}
          >
            <DataObjectOutlinedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={rootAnchor}
        open={rootOpen}
        onClose={closeAll}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        {catalog.groups.map((group) => (
          <MenuItem
            key={group.id}
            onClick={(event) => handleGroupOpen(event, group)}
            sx={{ py: 0.75, minHeight: 36 }}
          >
            <ListItemText
              primary={group.label}
              slotProps={{
                primary: { variant: 'body2', className: 'font-medium' },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              {group.items.length > 1 ? (
                <Chip
                  label={group.items.length}
                  size="small"
                  className="h-5 min-w-5 rounded-md px-1 text-[0.6875rem] font-semibold"
                />
              ) : null}
              <ChevronRightOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          </MenuItem>
        ))}

        {!hasGroups ? (
          <MenuItem disabled sx={{ py: 1 }}>
            <Typography variant="body2" color="text.secondary">
              No list fields found
            </Typography>
          </MenuItem>
        ) : null}
      </Menu>

      <Menu
        anchorEl={groupAnchor}
        open={groupOpen}
        onClose={() => {
          setGroupAnchor(null);
          setActiveGroup(null);
          setVariantAnchor(null);
          setActiveItem(null);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        {activeGroup?.items.map((item) => (
          <MenuItem
            key={`${activeGroup.id}-${item.label}-${item.variants.map((variant) => variant.token).join('-')}`}
            onClick={(event) => handleItemClick(event, item)}
            sx={{ py: 0.75, minHeight: 36 }}
          >
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { variant: 'body2' } }}
            />
            {item.variants.length > 1 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                <Chip
                  label={item.variants.length}
                  size="small"
                  className="h-5 min-w-5 rounded-md px-1 text-[0.6875rem] font-semibold"
                />
                <ChevronRightOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Box>
            ) : null}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={variantAnchor}
        open={variantOpen}
        onClose={() => {
          setVariantAnchor(null);
          setActiveItem(null);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: menuPaperSx } }}
      >
        {activeItem?.variants.map((variant) => (
          <Tooltip key={variant.token} title={variantTooltip(variant)} placement="left">
            <MenuItem
              onClick={() => handleInsert(variant.token)}
              sx={{ py: 0.75, minHeight: 36 }}
            >
              <ListItemText
                primary={variant.label}
                secondary={`{{${variant.token}}}`}
                slotProps={{
                  primary: { variant: 'body2' },
                  secondary: {
                    variant: 'caption',
                    sx: { fontFamily: 'monospace' },
                  },
                }}
              />
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>
    </>
  );
}
