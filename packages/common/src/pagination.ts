export function parsePaginationQuery(query: any) {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string, 10) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationResponse<T>(data: T[], total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
