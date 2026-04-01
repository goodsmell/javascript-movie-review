import image from "../templates/images/star_filled.png";
import { fetchPopularMovies, fetchSearchedMovies } from "./api/fetchMovies";
import { ThumbnailInfo, Movie } from "../types/movie";
import { renderPopularMovies, renderTopRatedMovie } from "./render";
import searchNotFoundIcon from "./assets/searchNotFoundIcon.png";

let popularMoviePage = 1;
let searchMoviePage = 1;
const popularMovies = await fetchPopularMovies(popularMoviePage);

addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;

  if (app) {
    app.appendChild(buttonImage);
  }
});

const moreButton = document.querySelector(".more-button");

moreButton!.addEventListener("click", async (e) => {
  const thumbnailList = document.querySelector(".thumbnail-list");
  const searchInput: HTMLInputElement | null =
    document.querySelector(".search-input");
  const searchValue = searchInput?.value;

  // 검색 결과 더보기
  if (searchValue!.length !== 0) {
    const movies = await fetchSearchedMovies(
      ++searchMoviePage,
      searchInput!.value,
    );
    movies!.forEach((movie) => {
      const thumbnail = makeMovieThumbnail(movie);
      thumbnailList?.appendChild(thumbnail);
    });
  } else {
    // 인기 영화 더보기
    const movies = await fetchPopularMovies(++popularMoviePage);
    movies!.forEach((movie) => {
      const thumbnail = makeMovieThumbnail(movie);
      thumbnailList?.appendChild(thumbnail);
    });
  }
});

const searchForm = document.querySelector(".search");

searchForm!.addEventListener("submit", async (e) => {
  e.preventDefault();
  const searchInput: HTMLInputElement | null =
    document.querySelector(".search-input");
  const backgroundConatiner: HTMLDivElement | null = document.querySelector(
    ".background-container",
  );
  backgroundConatiner!.style.display = "none";

  const sectionTitle = document.querySelector(".section-title");
  const thumbnailList = document.querySelector(".thumbnail-list");

  const searchValue = searchInput?.value;

  // 상단 컨테이너 숨기기

  // 제목 변경
  sectionTitle!.textContent = `"${searchValue}"검색 결과`;

  // 기존 리스트 초기화
  thumbnailList?.replaceChildren();

  // 검색 데이터 가져오기
  const movies = await fetchSearchedMovies(1, searchInput!.value);

  if (movies!.length === 0) {
    const sectionContainer = document.querySelector(".section-container");
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
    sectionContainer?.appendChild(notSearchFoundContainer);
  }
  // 검색 결과 렌더링
  renderPopularMovies(extractThumbnailInfo(movies!));
});

export const makeMovieThumbnail = (movie: ThumbnailInfo) => {
  const fragment = document.createDocumentFragment();
  const list = document.createElement("li");

  const item = document.createElement("div");
  item.className = "item";

  const thumbnail = document.createElement("img");
  thumbnail.className = "thumbnail";
  thumbnail.src = `${import.meta.env.VITE_TMDB_IMG_URL}${movie.poster_path}`;
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

const extractThumbnailInfo = (movies: Movie[]) => {
  return movies!.map((movie) => {
    const thumbnailInfo: ThumbnailInfo = {
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
    };

    return thumbnailInfo;
  });
};

renderPopularMovies(extractThumbnailInfo(popularMovies!));
renderTopRatedMovie(extractThumbnailInfo(popularMovies!)[0]);
