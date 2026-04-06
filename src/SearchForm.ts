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

      const searchValue = this.#searchInput?.value ?? "";

      sectionTitle!.textContent = `"${searchValue}"검색 결과`;

      thumbnailList?.replaceChildren();
      if (notSearchFoundContainer) {
        notSearchFoundContainer.remove();
      }
      try {
        renderSkeleton();

        const { movies } = await fetchSearchedMovies(1, searchValue);

        if (movies!.length === 0) {
          const empty = makeNotFoundContainer();
          sectionContainer?.appendChild(empty);
          moreButton!.style.display = "none";
          return;
        }

        renderMoviesList(extractThumbnailInfo(movies!));
      } catch (error) {
        console.error("검색 중 에러:", error);
        alert("검색 중 문제가 발생했어요");

        moreButton!.style.display = "none";
      } finally {
        removeSkeleton();
      }
    });
  }
}

export default SearchForm;
