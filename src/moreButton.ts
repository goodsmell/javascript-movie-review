import { removeSkeleton, renderSkeleton } from "./render";
import { fetchSearchedMovies, fetchPopularMovies } from "./api/fetchMovies";
import { makeMovieThumbnail } from "./thumnailManager";
import PageStore from "./store";

class MoreButton {
  #moreButton: HTMLButtonElement | null;

  constructor() {
    this.#moreButton = document.querySelector(".more-button");
  }

  hide() {
    this.#moreButton!.style.display = "none";
  }

  disable() {
    this.#moreButton!.disabled = true;
    this.#moreButton!.style.cursor = "not-allowed";
  }

  able() {
    this.#moreButton!.disabled = false;
    this.#moreButton!.style.cursor = "pointer";
  }

  bindEvent() {
    this.#moreButton!.addEventListener("click", async (e) => {
      this.disable();
      const thumbnailList = document.querySelector(".thumbnail-list");
      const searchInput: HTMLInputElement | null =
        document.querySelector(".search-input");
      const searchValue = searchInput?.value;

      if (searchValue!.length !== 0) {
        renderSkeleton();

        const { movies, nowPage, totalPages } = await fetchSearchedMovies(
          ++PageStore.searchMoviePage,
          searchInput!.value,
        );
        removeSkeleton();
        movies!.forEach((movie) => {
          const thumbnail = makeMovieThumbnail(movie);
          thumbnailList?.appendChild(thumbnail);
        });

        if (nowPage === totalPages) {
          this.#moreButton!.style.display = "none";
        }
      } else {
        renderSkeleton();
        const { movies, nowPage, totalPages } = await fetchPopularMovies(
          ++PageStore.popularMoviePage,
        );
        removeSkeleton();
        movies!.forEach((movie) => {
          const thumbnail = makeMovieThumbnail(movie);
          thumbnailList?.appendChild(thumbnail);
        });

        if (nowPage === totalPages) {
          this.#moreButton!.style.display = "none";
        }
      }

      this.able();
    });
  }
}

export default MoreButton;
