import { renderMoviesList, removeSkeleton, renderSkeleton } from "./render";
import { fetchSearchedMovies } from "./api/fetchMovies";
import { makeNotFoundContainer } from "./makeNotFoundContainer";
import { extractThumbnailInfo } from "./thumnailManager";

class SearchForm {
  #searchForm: HTMLFormElement | null;
  #searchInput: HTMLInputElement | null;

  constructor() {
    this.#searchForm = document.querySelector(".search");
    this.#searchInput = document.querySelector(".search-input");
  }

  bindEvent() {
    const moreButton: HTMLButtonElement | null =
      document.querySelector(".more-button");
    this.#searchForm!.addEventListener("submit", async (e) => {
      e.preventDefault();

      const backgroundConatiner: HTMLDivElement | null = document.querySelector(
        ".background-container",
      );

      backgroundConatiner!.style.display = "none";

      const sectionContainer = document.querySelector(".section-container");
      const sectionTitle = document.querySelector(".section-title");
      const thumbnailList = document.querySelector(".thumbnail-list");
      const notSearchFoundContainer = document.querySelector(
        ".not-search-found-container",
      );

      const searchValue = this.#searchInput?.value;

      sectionTitle!.textContent = `"${searchValue}"검색 결과`;

      thumbnailList?.replaceChildren();
      if (notSearchFoundContainer) {
        notSearchFoundContainer.remove();
      }

      renderSkeleton();
      const { movies } = await fetchSearchedMovies(1, this.#searchInput!.value);
      removeSkeleton();

      if (movies!.length === 0) {
        const notSearchFoundContainer = makeNotFoundContainer();
        sectionContainer?.appendChild(notSearchFoundContainer);
        moreButton!.style.display = "none";
      }

      renderMoviesList(extractThumbnailInfo(movies!));
    });
  }
}

export default SearchForm;
