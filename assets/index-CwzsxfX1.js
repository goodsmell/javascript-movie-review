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
const accessToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMDU4NTE0NWE1OTk0MzllZGQ4NmJmYTg0MDlmNjQwYiIsIm5iZiI6MTc3NDg3MDEzOC4zMzQsInN1YiI6IjY5Y2E1ZTdhOWI4YjFiZDdmMDI2Mzg0ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.OgnU09QNqwQMMpTGRKko_0XG9fKFohD_V4rcq8-s3bQ";
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
    console.log(data);
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
const fetchMoviesDetail = async (id) => {
  const response = await fetch(
    `${apiUrl}/movie/${id}?language=ko-KR`,
    REQUEST_OPTIONS
  );
  if (!response.ok) {
    throw new Error("영화 정보를 불러오는 중 에러가 발생했습니다.");
  }
  try {
    const data = await response.json();
    console.log(data);
    return data;
  } catch {
    throw new Error("서버 응답을 처리할 수 없습니다.");
  }
};
const mapToThumbnailInfo = (movies) => {
  return movies.map((movie) => ({
    title: movie.title,
    poster_path: movie.poster_path,
    vote_average: movie.vote_average,
    id: movie.id
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
  item.dataset.movieId = String(movie.id);
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
const renderMoviesList = (movies, options = {}, onLoadNextPage2) => {
  const { append = true } = options;
  const thumbnailList = document.querySelector(".thumbnail-list");
  const sentinel = document.createElement("div");
  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }
  if (!append) {
    thumbnailList.replaceChildren();
  }
  const thumbnailInfos = mapToThumbnailInfo(movies);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && onLoadNextPage2) {
        observer.unobserve(entry.target);
        onLoadNextPage2();
      }
    });
  });
  thumbnailInfos.forEach((movie) => {
    const movieThumbnail = createMovieThumbnail(movie);
    thumbnailList.appendChild(movieThumbnail);
  });
  thumbnailList.append(sentinel);
  observer.observe(sentinel);
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
const getYear = (date) => {
  const parseDate = date.split("-");
  return parseDate[0];
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
  #search;
  #view;
  constructor() {
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
      const movies = await this.lodeList(1);
      if (movies.length === 0) {
        this.renderEmptyResult();
        return;
      }
      const loadMore = async () => {
        try {
          renderSkeleton();
          const movies2 = await this.lodeList(PageStore.page + 1);
          removeSkeleton();
          if (!movies2.length) return;
          renderMoviesList(movies2, { append: true }, loadMore);
        } finally {
          removeSkeleton();
        }
      };
      renderMoviesList(movies, { append: false }, loadMore);
    } catch (error) {
      this.handleSearchError(error);
    } finally {
      removeSkeleton();
    }
  }
  async lodeList(page) {
    const { movies, nowPage, totalPages } = await fetchSearchedMovies(
      page,
      PageStore.query
    );
    PageStore.setPagination(nowPage, totalPages);
    return movies;
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
class Modal {
  #modal;
  #closeBtn;
  #title;
  #category;
  #rate;
  #detail;
  #image;
  constructor() {
    const modal2 = document.querySelector(".modal-background");
    const closeBtn = document.querySelector(".close-modal");
    const title = document.querySelector(
      ".modal-description h2"
    );
    const category = document.querySelector(
      ".modal-description .category"
    );
    const rate = document.querySelector(
      ".modal-description .rate span"
    );
    const detail = document.querySelector(
      ".modal-description .detail"
    );
    const image = document.querySelector(".modal-image img");
    if (!modal2 || !closeBtn || !title || !category || !rate || !detail || !image) {
      throw new Error("모달 요소를 찾을 수 없습니다.");
    }
    this.#modal = modal2;
    this.#closeBtn = closeBtn;
    this.#title = title;
    this.#category = category;
    this.#rate = rate;
    this.#detail = detail;
    this.#image = image;
  }
  bindEvent() {
    this.#closeBtn.addEventListener("click", () => this.close());
    this.#modal.addEventListener("click", (e) => {
      if (e.target === this.#modal) {
        this.close();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    });
  }
  fill(movie) {
    this.#title.textContent = movie.title;
    this.#category.textContent = movie.categoryText;
    this.#rate.textContent = movie.voteAverage.toString();
    this.#detail.textContent = movie.overview;
    this.#image.style.opacity = "0";
    this.#image.src = movie.posterPath;
    this.#image.onload = () => {
      this.#image.style.opacity = "1";
    };
    this.#image.alt = movie.title;
  }
  openEmpty() {
    this.#title.textContent = "";
    this.#category.textContent = "";
    this.#rate.textContent = "";
    this.#detail.textContent = "";
    this.#image.style.opacity = "0";
    this.#modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  close() {
    this.#modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}
const RATING_LABELS = {
  0: "",
  1: "최악이에요",
  2: "별로예요",
  3: "보통이에요",
  4: "좋아요",
  5: "명작이에요"
};
class Review {
  #stars;
  #scoreEl;
  #labelEl;
  #selectedRating = 0;
  #movieId = 0;
  #storage;
  constructor(storage) {
    const stars = document.querySelectorAll(".rating-star");
    const scoreEl = document.querySelector(".rating-score");
    const labelEl = document.querySelector(".rating-text");
    if (!stars.length || !scoreEl || !labelEl) {
      throw new Error("별점 요소를 찾을 수 없습니다.");
    }
    this.#stars = stars;
    this.#scoreEl = scoreEl;
    this.#labelEl = labelEl;
    this.#storage = storage;
  }
  load(movieId) {
    this.#movieId = movieId;
    this.#selectedRating = this.#storage.get(movieId);
    this.#renderStars(this.#selectedRating);
    this.#updateText(this.#selectedRating);
  }
  bindEvent() {
    this.#stars.forEach((star) => {
      star.addEventListener("click", () => {
        this.#selectedRating = Number(star.dataset.value);
        this.#storage.save(this.#movieId, this.#selectedRating);
        this.#renderStars(this.#selectedRating);
        this.#updateText(this.#selectedRating);
      });
      star.addEventListener("mouseover", () => {
        this.#renderStars(Number(star.dataset.value));
      });
    });
    document.querySelector(".rating-stars")?.addEventListener("mouseleave", () => {
      this.#renderStars(this.#selectedRating);
    });
  }
  #renderStars(rating) {
    this.#stars.forEach((star) => {
      const value = Number(star.dataset.value);
      star.classList.toggle("filled", value <= rating);
    });
  }
  #updateText(rating) {
    this.#scoreEl.textContent = `(${rating * 2}/10)`;
    this.#labelEl.firstChild.textContent = RATING_LABELS[rating] + " ";
  }
}
class LocalRatingStorage {
  get(movieId) {
    return Number(localStorage.getItem(`rating_${movieId}`)) || 0;
  }
  save(movieId, rating) {
    localStorage.setItem(`rating_${movieId}`, String(rating));
  }
}
class MovieItem {
  #thumbnailList;
  #onClickMovie;
  constructor(onClickMovie) {
    const thumbnailList = document.querySelector(".thumbnail-list");
    if (!thumbnailList) {
      throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
    }
    this.#thumbnailList = thumbnailList;
    this.#onClickMovie = onClickMovie;
  }
  bindEvent() {
    this.#thumbnailList.addEventListener("click", (event) => {
      const target = event.target;
      const movieItem2 = target.closest(".item");
      if (!(movieItem2 instanceof HTMLElement)) {
        return;
      }
      this.handleClick(movieItem2);
    });
  }
  handleClick(movieItem2) {
    const movieId = movieItem2.dataset.movieId;
    if (!movieId) {
      throw new Error("movieId를 찾을 수 없습니다.");
    }
    this.#onClickMovie(movieId);
  }
}
const searchForm = new SearchForm();
const logo = new Logo(resetToPopularView);
const modal = new Modal();
const review = new Review(new LocalRatingStorage());
const movieItem = new MovieItem(async (movieId) => {
  try {
    modal.openEmpty();
    const movieDetail = await fetchMoviesDetail(Number(movieId));
    modal.fill({
      title: movieDetail.title,
      overview: movieDetail.overview,
      voteAverage: movieDetail.vote_average,
      posterPath: `https://image.tmdb.org/t/p/original/${movieDetail.poster_path}`,
      categoryText: `${getYear(movieDetail.release_date)} · ${movieDetail.genres.map((genre) => genre.name).join(", ")}`
    });
    review.load(Number(movieId));
  } catch (error) {
    throw new Error("dd");
  }
});
function bindComponentEvents() {
  searchForm.bindEvent();
  logo.bindEvent();
  movieItem.bindEvent();
  modal.bindEvent();
  review.bindEvent();
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
    sectionTitle.textContent = "지금 인기 있는 영화";
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
    const movies = await onLoadNextPage(PageStore.page);
    const thumbnails = mapToThumbnailInfo(movies);
    const loadMore = async () => {
      try {
        renderSkeleton();
        const movies2 = await onLoadNextPage(PageStore.page + 1);
        removeSkeleton();
        if (!movies2.length) return;
        renderMoviesList(movies2, { append: true }, loadMore);
      } finally {
        removeSkeleton();
      }
    };
    renderMoviesList(movies, { append: false }, loadMore);
    renderTopRatedMovie(thumbnails[0]);
  } catch (error) {
    console.log(error);
    alert("영화 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    removeSkeleton();
  }
}
async function onLoadNextPage(page) {
  const { movies, nowPage, totalPages } = await fetchPopularMovies(page);
  PageStore.page = nowPage;
  PageStore.totalPages = totalPages;
  return movies;
}
async function bootstrap() {
  bindComponentEvents();
  await resetToPopularView();
}
await bootstrap();
