import { removeSkeleton, renderSkeleton } from "../render/skeleton";
import { renderMoviesList } from "../render/movieList";
import { fetchSearchedMovies, fetchPopularMovies } from "../api/fetchMovies";
import PageStore from "../store";

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

  private async loadMoreMovies() {
    const nextPage = PageStore.page + 1;

    const result =
      PageStore.mode === "search"
        ? await fetchSearchedMovies(nextPage, PageStore.query)
        : await fetchPopularMovies(nextPage);

    PageStore.setPagination(result.nowPage, result.totalPages);
    renderMoviesList(result.movies, { append: true });
    this.syncVisibility();
  }

  private async handleClick() {
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

export default MoreButton;
