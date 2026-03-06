/**
 * Utility untuk memproses pagination secara konsisten
 */
const getPagination = (query) => {
  // Ambil limit dari query (Swagger), jika tidak ada default ke 8
  const limit = parseInt(query.limit) || 8;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  return { limit, offset, page };
};

const formatPagination = (totalData, limit, currentPage) => {
  return {
    totalData: parseInt(totalData),
    currentPage: parseInt(currentPage),
    totalPages: Math.ceil(totalData / limit),
    perPage: limit
  };
};

module.exports = { getPagination, formatPagination };