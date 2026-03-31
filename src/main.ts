import image from "../templates/images/star_filled.png";
import { fetchPopularMovies } from "./api/fetchMovies";
import { ThumbnailInfo } from "../types/movie";
import { renderPopularMovies, renderTopRatedMovie } from "./render";
let nowPage = 1;
const popularMovies = await fetchPopularMovies(nowPage);

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
  
  const movies = await fetchPopularMovies(++nowPage);

  movies!.forEach((movie) => {
    const thumbnail = makeMovieThumbnail(movie);
    thumbnailList?.appendChild(thumbnail);
  });
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

const popularMovieThumbnailInfo: ThumbnailInfo[] = popularMovies!.map(
  (movie) => {
    const thumbnailInfo: ThumbnailInfo = {
      title: movie.title,
      poster_path: movie.poster_path,
      vote_average: movie.vote_average,
    };

    return thumbnailInfo;
  },
);

renderPopularMovies(popularMovieThumbnailInfo);
renderTopRatedMovie(popularMovieThumbnailInfo[0]);
