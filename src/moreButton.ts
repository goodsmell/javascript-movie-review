import { removeSkeleton, renderSkeleton } from "./render";
import { fetchSearchedMovies, fetchPopularMovies } from "./api/fetchMovies";
import { makeMovieThumbnail } from "./thumnailManager";
import PageStore from "./store";

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

  able() {
    this.#moreButton.disabled = false;
    this.#moreButton.style.cursor = "pointer";
  }

  bindEvent() {
    this.#moreButton.addEventListener("click", async () => {
      this.disable();

      const thumbnailList = document.querySelector(".thumbnail-list");
      const searchInput =
        document.querySelector<HTMLInputElement>(".search-input");
      const searchValue = searchInput?.value ?? "";

      try {
        renderSkeleton();

        let result;

        if (searchValue.length !== 0) {
          result = await fetchSearchedMovies(
            ++PageStore.searchMoviePage,
            searchValue,
          );
        } else {
          result = await fetchPopularMovies(++PageStore.popularMoviePage);
        }

        const { movies, nowPage, totalPages } = result;

        movies.forEach((movie) => {
          const thumbnail = makeMovieThumbnail(movie);
          thumbnailList?.appendChild(thumbnail);
        });

        if (nowPage === totalPages) {
          this.hide();
        }
      } catch (error) {
        console.error("영화 데이터를 불러오는 중 에러 발생:", error);
        alert("데이터를 불러오지 못했습니다");
      } finally {
        removeSkeleton();
        this.able();
      }
    });
  }
}

export default MoreButton;
