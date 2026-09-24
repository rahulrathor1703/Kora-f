export function paginateRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  if (pageSize <= 0) {
    return rows;
  }

  const start = page * pageSize;
  return rows.slice(start, start + pageSize);
}

export function getPageCount(totalRows: number, pageSize: number): number {
  if (pageSize <= 0 || totalRows === 0) {
    return 0;
  }

  return Math.ceil(totalRows / pageSize);
}

export function clampPage(page: number, totalRows: number, pageSize: number): number {
  const pageCount = getPageCount(totalRows, pageSize);
  if (pageCount === 0) {
    return 0;
  }

  return Math.min(page, pageCount - 1);
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
