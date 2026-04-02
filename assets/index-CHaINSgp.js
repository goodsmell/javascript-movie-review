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
const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAxCAYAAACcXioiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKXSURBVHgB7ZhBbtQwFIZ/zyAxu8IN0hNANqh0Q+YG9ASlJyhzgpmeADgBvQG9QbOCJXMDwgnIqoyEqPnjcWmVxElsPU9bKZ/kZuQ4rp/f+/OeA4yMjDxqFCKhvyHh7B+gUWKGhUp5jcATxGPJxb81v67wk39XiMAE8cj+/5riVH/HM0QgigEMn3e8JLcdXPzvOwYJEssDx40ehVNEQFzERrzAj9abU6TqFdYQJIYHls47f6yoBYlhQOa8E0HMogY0xNsYIC9maQ8c944QFrOYiDvFW2eG51KZWdIDy8Ejr/AeQnh7wIhwwzZl+8s2YbvGC/iXCmd8ds1nS85Vcq6qZip9PdNqAMOh2s3ENMUFattUnHKguQAaoYwhBbarLNm3Vq9pdI2GAfZN8hkPEc2q9hAf73ZNWgbtZpdDUM3wahhgLTzDQ0PjE0PovN7tFDFDaQWfN0tMWkLnhs63EI3IsNVDgvtgK+Yj7nzuGtL7GrUJ6hK7N6Jgm3PxRdeg3kRmJ5iz5dgdOXNC2rf4Cq9EthNdVGI9HJ6p/TNxTCM6xOoiqJjTX3kwUfgCWeZdYnURXI3SE1XlmUCGgovfRwBhHrhktp7hFyQJLLHDyukZXkKaTdicYQZo+cN56JyhB5o3kCdoTv/XaIz4vyFAB/4eeBrnE6Eh4ItFSAhlA8cVbCe2FQOfyeBJiAH9scpywNYy56aG3yA1fRJz1/CrhfriX/GQXpUDjow6qLL11IGfB1zxr82he6EOzK7nrser6tJmXPeJz1MHfgao1mSTsz/1KcJoxIqXfT530XI7gwd+BlzzH2rr3u31hIuZD6nb6xhvHOAIdZFPsAcPQsrpBNUuzXAh9XnQzrnipuxxRYuQDRkZGRm5H/4BIkyx5W7xkPAAAAAASUVORK5CYII=";
const apiUrl = "https://api.themoviedb.org/3";
const accessToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiYjQ2MjRmMjdjMWVmZTQ4NzE3MTI1OTdkNmFiNjg0ZiIsIm5iZiI6MTc3NDg3MDEzOC4zMzQsInN1YiI6IjY5Y2E1ZTdhOWI4YjFiZDdmMDI2Mzg0ZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._9ls2F5VNo4k4c3UBqmC7_IooCgk1ITzrN3_x3LauTc";
const fetchPopularMovies = async (page) => {
  const response = await fetch(
    `${apiUrl}/movie/popular?language=ko-KR&page=${page}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!response.ok) {
    throw new Error("영화를 불러오는 데 실패했습니다.");
  }
  const data = await response.json();
  return {
    movies: data.results,
    nowPage: data.page,
    totalPages: data.total_pages
  };
};
const fetchSearchedMovies = async (page, searchTitle) => {
  const response = await fetch(
    `${apiUrl}/search/movie?query=${encodeURIComponent(searchTitle)}&include_adult=false&language=ko-KR&page=${page}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!response.ok) {
    throw new Error("영화 검색 중 에러가 발생했습니다.");
  }
  const data = await response.json();
  return {
    movies: data.results,
    nowPage: data.page,
    totalPages: data.total_pages
  };
};
const extractThumbnailInfo = (movies) => {
  return movies.map((movie) => {
    const thumbnailInfo = {
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average
    };
    return thumbnailInfo;
  });
};
const makeMovieThumbnail = (movie) => {
  const fragment = document.createDocumentFragment();
  const list = document.createElement("li");
  const item = document.createElement("div");
  item.className = "item";
  const thumbnail = document.createElement("img");
  thumbnail.className = "thumbnail";
  thumbnail.src = `${"https://image.tmdb.org/t/p/w500"}${movie.poster_path}`;
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
class Logo {
  #logo;
  constructor() {
    this.#logo = document.querySelector(".logo");
  }
  bindEvent() {
    this.#logo?.addEventListener("click", () => {
      location.reload();
    });
  }
}
const renderMoviesList = (popularMovies) => {
  const thumbnailList = document.querySelector(".thumbnail-list");
  popularMovies.forEach((movie) => {
    const movieThumbnail = makeMovieThumbnail(movie);
    thumbnailList?.appendChild(movieThumbnail);
  });
};
const renderTopRatedMovie = (movie) => {
  const rate = document.querySelector(".rate-value");
  const title = document.querySelector(".title");
  const backgroundImg = document.querySelector(".background-img");
  title.textContent = movie.title;
  rate.textContent = movie.vote_average.toString();
  backgroundImg.src = `${"https://image.tmdb.org/t/p/w500"}${movie.poster_path}`;
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
  thumbnailList.appendChild(fragment);
};
const removeSkeleton = () => {
  const skeletonNodes = document.querySelectorAll(".movie-skeleton");
  skeletonNodes.forEach((node) => node.remove());
};
const searchNotFoundIcon = "/javascript-movie-review/assets/searchNotFoundIcon-CaGJkkvv.png";
const makeNotFoundContainer = () => {
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
class SearchForm {
  #searchForm;
  #searchInput;
  constructor() {
    this.#searchForm = document.querySelector(".search");
    this.#searchInput = document.querySelector(".search-input");
  }
  bindEvent() {
    const moreButton2 = document.querySelector(".more-button");
    this.#searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const backgroundConatiner = document.querySelector(
        ".background-container"
      );
      backgroundConatiner.style.display = "none";
      const sectionContainer = document.querySelector(".section-container");
      const sectionTitle = document.querySelector(".section-title");
      const thumbnailList = document.querySelector(".thumbnail-list");
      const notSearchFoundContainer = document.querySelector(
        ".not-search-found-container"
      );
      const searchValue = this.#searchInput?.value;
      sectionTitle.textContent = `"${searchValue}"검색 결과`;
      thumbnailList?.replaceChildren();
      if (notSearchFoundContainer) {
        notSearchFoundContainer.remove();
      }
      renderSkeleton();
      const { movies } = await fetchSearchedMovies(1, this.#searchInput.value);
      removeSkeleton();
      if (movies.length === 0) {
        const notSearchFoundContainer2 = makeNotFoundContainer();
        sectionContainer?.appendChild(notSearchFoundContainer2);
        moreButton2.style.display = "none";
      }
      renderMoviesList(extractThumbnailInfo(movies));
    });
  }
}
const PageStore = {
  popularMoviePage: 1,
  searchMoviePage: 1
};
class MoreButton {
  #moreButton;
  constructor() {
    this.#moreButton = document.querySelector(".more-button");
  }
  hide() {
    this.#moreButton.style.display = "none";
  }
  disable() {
    this.#moreButton.disabled = true;
    this.#moreButton.style.cursor = "not-allowed";
  }
  able() {
    this.#moreButton.disabled = false;
    this.#moreButton.style.cursor = "pointer";
  }
  bindEvent() {
    this.#moreButton.addEventListener("click", async (e) => {
      this.disable();
      const thumbnailList = document.querySelector(".thumbnail-list");
      const searchInput = document.querySelector(".search-input");
      const searchValue = searchInput?.value;
      if (searchValue.length !== 0) {
        renderSkeleton();
        const { movies, nowPage, totalPages } = await fetchSearchedMovies(
          ++PageStore.searchMoviePage,
          searchInput.value
        );
        removeSkeleton();
        movies.forEach((movie) => {
          const thumbnail = makeMovieThumbnail(movie);
          thumbnailList?.appendChild(thumbnail);
        });
        if (nowPage === totalPages) {
          this.#moreButton.style.display = "none";
        }
      } else {
        renderSkeleton();
        const { movies, nowPage, totalPages } = await fetchPopularMovies(
          ++PageStore.popularMoviePage
        );
        removeSkeleton();
        movies.forEach((movie) => {
          const thumbnail = makeMovieThumbnail(movie);
          thumbnailList?.appendChild(thumbnail);
        });
        if (nowPage === totalPages) {
          this.#moreButton.style.display = "none";
        }
      }
      this.able();
    });
  }
}
const moreButton = new MoreButton();
moreButton.bindEvent();
const searchForm = new SearchForm();
searchForm.bindEvent();
const logo = new Logo();
logo.bindEvent();
try {
  renderSkeleton();
  const { movies: popularMovies, totalPages: popularTotalPages } = await fetchPopularMovies(PageStore.popularMoviePage);
  removeSkeleton();
  if (PageStore.popularMoviePage === popularTotalPages) {
    moreButton.hide();
  }
  renderMoviesList(extractThumbnailInfo(popularMovies));
  renderTopRatedMovie(extractThumbnailInfo(popularMovies)[0]);
} catch (error) {
  alert(error);
}
addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;
  if (app) {
    app.appendChild(buttonImage);
  }
});
