'use client';

import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import { dataTableClassNames } from './dataTableStyles';

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  pageSizeOptions?: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function DataTablePagination({
  page,
  pageSize,
  totalRows,
  pageSizeOptions = [5, 10, 25, 50],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  if (totalRows === 0) {
    return null;
  }

  return (
    <Box
      className={`${dataTableClassNames.footer} flex justify-end border-t border-border/60`}
    >
      <TablePagination
        component="div"
        count={totalRows}
        page={page}
        onPageChange={(_event, nextPage) => onPageChange(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => {
          onPageSizeChange(Number.parseInt(event.target.value, 10));
          onPageChange(0);
        }}
        rowsPerPageOptions={[...pageSizeOptions]}
        labelRowsPerPage="Rows per page:"
        sx={{
          width: 'auto',
          ml: 'auto',
          '.MuiTablePagination-toolbar': {
            px: { xs: 1, sm: 2 },
            py: 1,
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'flex-end',
          },
          '.MuiTablePagination-spacer': {
            flex: '0 0 0',
          },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
            fontSize: '0.8125rem',
            color: 'text.secondary',
          },
        }}
      />
    </Box>
  );
}
