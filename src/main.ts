import image from "../templates/images/star_filled.png";
import { fetchPopularMovies, fetchSearchedMovies } from "./api/fetchMovies";
import { ThumbnailInfo, Movie } from "../types/movie";
import {
  renderPopularMovies,
  renderTopRatedMovie,
  renderSkeleton,
  removeSkeleton,
} from "./render";
import searchNotFoundIcon from "./assets/searchNotFoundIcon.png";

let popularMoviePage = 1;
let searchMoviePage = 1;

const moreButton: HTMLButtonElement | null =
  document.querySelector(".more-button");

// 스켈레톤 메서드
renderSkeleton();
const { movies: popularMovies, totalPages: popularTotalPages } =
  await fetchPopularMovies(popularMoviePage);
removeSkeleton();

if (popularMoviePage === popularTotalPages) {
  moreButton!.style.display = "none";
}

addEventListener("load", () => {
  const app = document.querySelector("#app");
  const buttonImage = document.createElement("img");
  buttonImage.src = image;

  if (app) {
    app.appendChild(buttonImage);
  }
});

moreButton!.addEventListener("click", async (e) => {
  const thumbnailList = document.querySelector(".thumbnail-list");
  const searchInput: HTMLInputElement | null =
    document.querySelector(".search-input");
  const searchValue = searchInput?.value;

  // 검색 결과 더보기
  if (searchValue!.length !== 0) {
    renderSkeleton();
    const { movies, nowPage, totalPages } = await fetchSearchedMovies(
      ++searchMoviePage,
      searchInput!.value,
    );
    removeSkeleton();
    movies!.forEach((movie) => {
      const thumbnail = makeMovieThumbnail(movie);
      thumbnailList?.appendChild(thumbnail);
    });

    // 뒤에 페이지 없으면 숨기기
    if (nowPage === totalPages) {
      moreButton!.style.display = "none";
    }
  } else {
    // 인기 영화 더보기
    renderSkeleton();
    const { movies, nowPage, totalPages } = await fetchPopularMovies(
      ++popularMoviePage,
    );
    removeSkeleton();
    movies!.forEach((movie) => {
      const thumbnail = makeMovieThumbnail(movie);
      thumbnailList?.appendChild(thumbnail);
    });

    if (nowPage === totalPages) {
      moreButton!.style.display = "none";
    }
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

  sectionTitle!.textContent = `"${searchValue}"검색 결과`;

  thumbnailList?.replaceChildren();
  renderSkeleton();
  const { movies } = await fetchSearchedMovies(1, searchInput!.value);
  removeSkeleton();
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

    moreButton!.style.display = "none";
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

renderPopularMovies(extractThumbnailInfo(popularMovies));
renderTopRatedMovie(extractThumbnailInfo(popularMovies)[0]);
