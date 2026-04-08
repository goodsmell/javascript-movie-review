(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const apiUrl = "https://api.themoviedb.org/3";
const accessToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYjQ2MjRmMjdjMWVmZTQ4NzE3MTI1OTdkNmFiNjg0ZiIsIm5iZiI6MTc3NDg3MDEzOC4zMzQsInN1YiI6IjY5Y2E1ZTdhOWI4YjFiZDdmMDI2Mzg0ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._9ls2F5VNo4k4c3UBqmC7_IooCgk1ITzrN3_x3LauTc";
const REQUEST_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${accessToken}`
  }
};
const parseMovieResponse = async (response, errorMessage) => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  try {
    const data = await response.json();
    return {
      movies: data.results,
      nowPage: data.page,
      totalPages: data.total_pages
    };
  } catch {
    throw new Error("서버 응답을 처리할 수 없습니다.");
  }
};
const requestMovieResponse = async (url, errorMessage) => {
  const response = await fetch(url, REQUEST_OPTIONS);
  return parseMovieResponse(response, errorMessage);
};
const fetchPopularMovies = async (page) => {
  return requestMovieResponse(
    `${apiUrl}/movie/popular?language=Ko&region=ko-KR&page=${page}`,
    "영화 목록을 불러오는 중 에러가 발생했습니다."
  );
};
const fetchSearchedMovies = async (page, searchTitle) => {
  return requestMovieResponse(
    `${apiUrl}/search/movie?query=${encodeURIComponent(searchTitle)}&include_adult=false&language=ko-KR&page=${page}`,
    "영화 검색 중 에러가 발생했습니다."
  );
};
const mapToThumbnailInfo = (movies) => {
  return movies.map((movie) => ({
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average
  }));
};
const renderSkeleton = () => {
  const thumbnailList = document.querySelector(".thumbnail-list");
  const fragment = new DocumentFragment();
  const skeleton = document.createElement("div");
  skeleton.className = "movie-skeleton";
  for (let i = 0; i < 20; i++) {
    const newNode = skeleton.cloneNode(true);
    fragment.appendChild(newNode);
  }
  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }
  thumbnailList.appendChild(fragment);
};
const removeSkeleton = () => {
  const skeletonNodes = document.querySelectorAll(".movie-skeleton");
  skeletonNodes.forEach((node) => node.remove());
};
const fallbackImg = "/javascript-movie-review/assets/movie_fallback_image-B4P22HsQ.svg";
const createMovieThumbnail = (movie) => {
  const fragment = document.createDocumentFragment();
  const list = document.createElement("li");
  const item = document.createElement("div");
  item.className = "item";
  const thumbnail = document.createElement("img");
  thumbnail.className = "thumbnail";
  thumbnail.src = movie.poster_path ? `${"https://image.tmdb.org/t/p/original"}${movie.poster_path}` : fallbackImg;
  thumbnail.alt = movie.title;
  const itemDesc = document.createElement("div");
  itemDesc.className = "item-desc";
  const rate = document.createElement("p");
  rate.className = "rate";
  const starImg = document.createElement("img");
  starImg.className = "star";
  starImg.src = "./templates/images/star_empty.png";
  const voteAverage = document.createElement("span");
  voteAverage.textContent = movie.vote_average.toString();
  const title = document.createElement("strong");
  title.textContent = movie.title;
  rate.appendChild(starImg);
  rate.appendChild(voteAverage);
  itemDesc.appendChild(rate);
  itemDesc.appendChild(title);
  item.appendChild(thumbnail);
  item.appendChild(itemDesc);
  list.appendChild(item);
  fragment.appendChild(list);
  return fragment;
};
const renderMoviesList = (movies, options = {}) => {
  const { append = true } = options;
  const thumbnailList = document.querySelector(".thumbnail-list");
  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }
  if (!append) {
    thumbnailList.replaceChildren();
  }
  const thumbnailInfos = mapToThumbnailInfo(movies);
  thumbnailInfos.forEach((movie) => {
    const movieThumbnail = createMovieThumbnail(movie);
    thumbnailList.appendChild(movieThumbnail);
  });
};
const renderTopRatedMovie = (movie) => {
  const rate = document.querySelector(".rate-value");
  const title = document.querySelector(".title");
  const backgroundImg = document.querySelector(".background-img");
  if (!title || !rate || !backgroundImg) {
    throw new Error("최고 평점 영화 렌더링에 필요한 요소를 찾을 수 없습니다.");
  }
  title.textContent = movie.title;
  rate.textContent = movie.vote_average.toString();
  backgroundImg.src = movie.poster_path ? `${"https://image.tmdb.org/t/p/original"}${movie.poster_path}` : fallbackImg;
};
const searchNotFoundIcon = "/javascript-movie-review/assets/searchNotFoundIcon-CaGJkkvv.png";
const createNotFoundElement = () => {
  const notSearchFoundContainer = document.createElement("div");
  const notSearchFoundImg = document.createElement("img");
  const notSearchFoundText = document.createElement("h2");
  notSearchFoundContainer.className = "not-search-found-container";
  notSearchFoundImg.className = "not-search-found-img";
  notSearchFoundText.className = "not-search-found-text";
  notSearchFoundImg.src = searchNotFoundIcon;
  notSearchFoundText.textContent = "검색 결과가 없습니다.";
  notSearchFoundContainer.appendChild(notSearchFoundImg);
  notSearchFoundContainer.appendChild(notSearchFoundText);
  return notSearchFoundContainer;
};
const PageStore = {
  mode: "popular",
  query: "",
  page: 1,
  totalPages: 1,
  setSearchMode(query) {
    this.mode = "search";
    this.query = query;
    this.page = 1;
  },
  setPopularMode() {
    this.mode = "popular";
    this.query = "";
    this.page = 1;
  },
  setPagination(page, totalPages) {
    this.page = page;
    this.totalPages = totalPages;
  }
};
class SearchForm {
  constructor(moreButton2) {
    this.moreButton = moreButton2;
    const form = document.querySelector(".search");
    const input = document.querySelector(".search-input");
    const backgroundContainer = document.querySelector(
      ".background-container"
    );
    const sectionContainer = document.querySelector(".section-container");
    const sectionTitle = document.querySelector(".section-title");
    const thumbnailList = document.querySelector(".thumbnail-list");
    if (!form || !input || !backgroundContainer || !sectionContainer || !sectionTitle || !thumbnailList) {
      throw new Error("필수 UI 요소를 찾을 수 없습니다.");
    }
    this.#search = { form, input };
    this.#view = {
      backgroundContainer,
      sectionContainer,
      sectionTitle,
      thumbnailList
    };
  }
  #search;
  #view;
  bindEvent() {
    this.#search.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }
  async handleSubmit() {
    const searchValue = this.#search.input.value.trim();
    if (!searchValue) {
      return;
    }
    PageStore.setSearchMode(searchValue);
    this.prepareSearchView(searchValue);
    try {
      renderSkeleton();
      const { movies, nowPage, totalPages } = await fetchSearchedMovies(
        1,
        PageStore.query
      );
      PageStore.setPagination(nowPage, totalPages);
      if (movies.length === 0) {
        this.renderEmptyResult();
        return;
      }
      renderMoviesList(movies, { append: false });
      this.moreButton.syncVisibility();
    } catch (error) {
      this.handleSearchError(error);
    } finally {
      removeSkeleton();
    }
  }
  prepareSearchView(searchValue) {
    this.#view.backgroundContainer.style.display = "none";
    this.#view.sectionTitle.textContent = `"${searchValue}" 검색 결과`;
    this.#view.thumbnailList.replaceChildren();
    this.removeNotFoundContainer();
  }
  renderEmptyResult() {
    const empty = createNotFoundElement();
    this.#view.sectionContainer.appendChild(empty);
    this.moreButton.hide();
  }
  removeNotFoundContainer() {
    const notSearchFoundContainer = document.querySelector(
      ".not-search-found-container"
    );
    notSearchFoundContainer?.remove();
  }
  handleSearchError(error) {
    console.error("검색 중 에러:", error);
    alert("검색 중 문제가 발생했어요");
    this.moreButton.hide();
  }
}
class MoreButton {
  #moreButton;
  constructor() {
    const moreButton2 = document.querySelector(".more-button");
    if (!moreButton2) {
      throw new Error("더보기 버튼 요소를 찾을 수 없습니다.");
    }
    this.#moreButton = moreButton2;
  }
  bindEvent() {
    this.#moreButton.addEventListener("click", async () => this.handleClick());
  }
  syncVisibility() {
    if (PageStore.page >= PageStore.totalPages) {
      this.hide();
      return;
    }
    this.show();
  }
  hide() {
    this.#moreButton.style.display = "none";
  }
  show() {
    this.#moreButton.style.display = "block";
  }
  disable() {
    this.#moreButton.disabled = true;
    this.#moreButton.style.cursor = "not-allowed";
  }
  enable() {
    this.#moreButton.disabled = false;
    this.#moreButton.style.cursor = "pointer";
  }
  async loadMoreMovies() {
    const nextPage = PageStore.page + 1;
    const result = PageStore.mode === "search" ? await fetchSearchedMovies(nextPage, PageStore.query) : await fetchPopularMovies(nextPage);
    PageStore.setPagination(result.nowPage, result.totalPages);
    renderMoviesList(result.movies, { append: true });
    this.syncVisibility();
  }
  async handleClick() {
    this.disable();
    try {
      renderSkeleton();
      await this.loadMoreMovies();
    } catch (error) {
      console.error("영화 데이터를 불러오는 중 에러 발생:", error);
      alert("데이터를 불러오지 못했습니다");
    } finally {
      removeSkeleton();
      this.enable();
    }
  }
}
class Logo {
  constructor(onReset) {
    this.onReset = onReset;
    this.#logo = document.querySelector(".logo");
  }
  #logo;
  bindEvent() {
    this.#logo?.addEventListener("click", this.onReset);
  }
}
const moreButton = new MoreButton();
const searchForm = new SearchForm(moreButton);
const logo = new Logo(resetToPopularView);
function bindComponentEvents() {
  moreButton.bindEvent();
  searchForm.bindEvent();
  logo.bindEvent();
}
function restorePopularViewUI() {
  const backgroundContainer = document.querySelector(".background-container");
  const sectionTitle = document.querySelector(".section-title");
  const notFoundContainer = document.querySelector(
    ".not-search-found-container"
  );
  if (backgroundContainer instanceof HTMLDivElement) {
    backgroundContainer.style.display = "flex";
  }
  if (sectionTitle) {
    sectionTitle.textContent = "지금 가장 인기 있는 영화";
  }
  notFoundContainer?.remove();
}
async function resetToPopularView() {
  try {
    PageStore.mode = "popular";
    PageStore.query = "";
    PageStore.page = 1;
    restorePopularViewUI();
    renderSkeleton();
    const { movies, nowPage, totalPages } = await fetchPopularMovies(
      PageStore.page
    );
    PageStore.page = nowPage;
    PageStore.totalPages = totalPages;
    const thumbnails = mapToThumbnailInfo(movies);
    if (PageStore.page === PageStore.totalPages) {
      moreButton.hide();
    } else {
      moreButton.show();
    }
    renderMoviesList(movies, { append: false });
    renderTopRatedMovie(thumbnails[0]);
  } catch (error) {
    alert("영화 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    removeSkeleton();
  }
}
async function bootstrap() {
  bindComponentEvents();
  await resetToPopularView();
}
await bootstrap();
