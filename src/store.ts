const PageStore = {
  mode: "popular" as "popular" | "search",
  query: "",
  page: 1,
  totalPages: 1,

  setSearchMode(query: string) {
    this.mode = "search";
    this.query = query;
    this.page = 1;
  },

  setPopularMode() {
    this.mode = "popular";
    this.query = "";
    this.page = 1;
  },

  setPagination(page: number, totalPages: number) {
    this.page = page;
    this.totalPages = totalPages;
  },
};

export default PageStore;
