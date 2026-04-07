import { removeSkeleton, renderSkeleton } from "./render";
import { fetchSearchedMovies, fetchPopularMovies } from "./api/fetchMovies";
import { makeMovieThumbnail } from "./thumnailManager";
import PageStore from "./store";
import { Movie } from "../types/movie";

class MoreButton {
  #moreButton: HTMLButtonElement;

  constructor() {
    const moreButton =
      document.querySelector<HTMLButtonElement>(".more-button");
    if (!moreButton) {
      throw new Error("더보기 버튼 요소를 찾을 수 없습니다.");
    }

    this.#moreButton = moreButton;
  }

  hide() {
    this.#moreButton.style.display = "none";
  }

  disable() {
    this.#moreButton.disabled = true;
    this.#moreButton.style.cursor = "not-allowed";
  }

  enable() {
    this.#moreButton.disabled = false;
    this.#moreButton.style.cursor = "pointer";
  }

  show() {
    this.#moreButton.style.display = "block";
  }

  bindEvent() {
    this.#moreButton.addEventListener("click", async () => this.handleClick());
  }

  private renderMovieList(movies: Movie[]) {
    const thumbnailList = document.querySelector(".thumbnail-list");
    movies.forEach((movie) => {
      const thumbnail = makeMovieThumbnail(movie);
      thumbnailList?.appendChild(thumbnail);
    });
  }

  private async loadMorePopularMovies() {
    const nextPage = PageStore.page + 1;
    const result = await fetchPopularMovies(nextPage);

    PageStore.page = result.nowPage;
    PageStore.totalPages = result.totalPages;

    this.renderMovieList(result.movies);

    if (PageStore.page >= PageStore.totalPages) {
      this.hide();
    }
  }

  private async loadMoreSearchResults() {
    const nextPage = PageStore.page + 1;
    const result = await fetchSearchedMovies(nextPage, PageStore.query);

    PageStore.page = result.nowPage;
    PageStore.totalPages = result.totalPages;

    this.renderMovieList(result.movies);
    if (PageStore.page >= PageStore.totalPages) {
      this.hide();
    }
  }

  private async handleClick() {
    this.disable();

    try {
      renderSkeleton();

      if (PageStore.mode === "search") {
        await this.loadMoreSearchResults();
      } else {
        await this.loadMorePopularMovies();
      }
    } catch (error) {
      console.error("영화 데이터를 불러오는 중 에러 발생:", error);
      alert("데이터를 불러오지 못했습니다");
    } finally {
      removeSkeleton();
      this.enable();
    }
  }
}

export default MoreButton;
