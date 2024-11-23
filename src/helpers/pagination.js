const pagination = (totalItems, itemsPerPage, currentPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage < 1 || currentPage > totalPages) {
        throw new Error("Invalid page number");
    }

    const nextPage = currentPage < totalPages ? currentPage + 1 : null;
    const previousPage = currentPage > 1 ? currentPage - 1 : null;

    return {
        currentPage: currentPage,
        totalPages: totalPages,
        nextPage: nextPage,
        previousPage: previousPage,
        totalItems: totalItems
    };
};

module.exports = pagination;

