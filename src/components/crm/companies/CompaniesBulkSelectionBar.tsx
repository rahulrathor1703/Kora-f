'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface CompaniesBulkSelectionBarProps {
  selectedCount: number;
  allMatching: boolean;
  pageCount: number;
  totalMatching: number;
  showSelectAllMatchingPrompt: boolean;
  onSelectAllMatching: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function CompaniesBulkSelectionBar({
  selectedCount,
  allMatching,
  pageCount,
  totalMatching,
  showSelectAllMatchingPrompt,
  onSelectAllMatching,
  onClearSelection,
  onDelete,
  isDeleting,
}: CompaniesBulkSelectionBarProps) {
  const countLabel =
    selectedCount === 1 ? '1 company selected' : `${selectedCount} companies selected`;

  return (
    <Stack spacing={1.5}>
      {showSelectAllMatchingPrompt ? (
        <Alert severity="info" className="rounded-2xl">
          <Typography variant="body2" component="span">
            All {pageCount} on this page selected.{' '}
            <Button
              variant="text"
              size="small"
              className="normal-case underline-offset-2"
              onClick={onSelectAllMatching}
            >
              Select all {totalMatching} matching companies
            </Button>
          </Typography>
        </Alert>
      ) : null}

      {allMatching ? (
        <Alert severity="info" className="rounded-2xl">
          <Typography variant="body2" component="span">
            All {totalMatching} companies matching your search and filters are
            selected.{' '}
            <Button
              variant="text"
              size="small"
              className="normal-case underline-offset-2"
              onClick={onClearSelection}
            >
              Clear selection
            </Button>
          </Typography>
        </Alert>
      ) : null}

      <Box className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3">
        <Typography variant="body2" className="font-medium">
          {countLabel}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="text"
            className="normal-case"
            onClick={onClearSelection}
            disabled={isDeleting}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="error"
            className="normal-case shadow-none"
            onClick={onDelete}
            disabled={isDeleting || selectedCount === 0}
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}
