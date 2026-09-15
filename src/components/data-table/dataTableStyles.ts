import type { SxProps, Theme } from '@mui/material/styles';

export const dataTableClassNames = {
  toolbar: 'data-table-toolbar',
  headSticky: 'data-table-head-sticky',
  rowHover: 'data-table-row-hover',
  scrollContainer: 'data-table-scroll-container',
  iconButtonGroup: 'data-table-icon-group',
  filterPanel: 'data-table-filter-panel',
  footer: 'data-table-footer',
  emptyIcon: 'data-table-empty-icon',
} as const;

export const dataTableSx = {
  headCell: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    py: 1.5,
    borderBottom: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
  } satisfies SxProps<Theme>,

  bodyCell: {
    py: 1.75,
    borderBottom: '1px solid',
    borderColor: 'divider',
    fontSize: '0.875rem',
  } satisfies SxProps<Theme>,

  actionsCell: {
    py: 1.75,
    px: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
    width: '1%',
  } satisfies SxProps<Theme>,

  actionsHeadCell: {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    py: 1.5,
    px: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
    width: '1%',
  } satisfies SxProps<Theme>,

  iconButtonActive: {
    color: 'primary.main',
    bgcolor: 'action.selected',
    '&:hover': {
      bgcolor: 'action.selected',
    },
  } satisfies SxProps<Theme>,
} as const;
