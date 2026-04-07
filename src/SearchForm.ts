import { renderMoviesList, removeSkeleton, renderSkeleton } from "./render";
import { fetchSearchedMovies } from "./api/fetchMovies";
import { makeNotFoundContainer } from "./makeNotFoundContainer";

import PageStore from "./store";

class SearchForm {
  #searchForm: HTMLFormElement;
  #searchInput: HTMLInputElement;

  constructor() {
    const searchForm = document.querySelector<HTMLFormElement>(".search");
    const searchInput =
      document.querySelector<HTMLInputElement>(".search-input");

    if (!searchForm || !searchInput) {
      throw new Error("검색 폼 요소를 찾을 수 없습니다.");
    }

    this.#searchForm = searchForm;
    this.#searchInput = searchInput;
  }

  bindEvent() {
    const moreButton: HTMLButtonElement | null =
      document.querySelector(".more-button");

    if (!moreButton) throw new Error("more-button 요소를 찾을 수 없습니다.");

    this.#searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const backgroundContainer: HTMLDivElement | null = document.querySelector(
        ".background-container",
      );
      const sectionContainer = document.querySelector(".section-container");
      const sectionTitle = document.querySelector(".section-title");
      const thumbnailList = document.querySelector(".thumbnail-list");
      const notSearchFoundContainer = document.querySelector(
        ".not-search-found-container",
      );

      const searchValue = this.#searchInput.value ?? "";

      PageStore.mode = "search";
      PageStore.query = searchValue;
      PageStore.page = 1;

      if (
        !backgroundContainer ||
        !sectionTitle ||
        !sectionContainer ||
        !thumbnailList
      ) {
        throw new Error("필수 UI 요소를 찾을 수 없습니다.");
      }

      backgroundContainer.style.display = "none";

      sectionTitle.textContent = `"${searchValue}"검색 결과`;

      thumbnailList.replaceChildren();
      if (notSearchFoundContainer) {
        notSearchFoundContainer.remove();
      }
      try {
        renderSkeleton();

        const { movies, nowPage, totalPages } = await fetchSearchedMovies(
          1,
          searchValue,
        );

        PageStore.page = nowPage;
        PageStore.totalPages = totalPages;

        if (movies.length === 0) {
          const empty = makeNotFoundContainer();
          sectionContainer.appendChild(empty);
          moreButton.style.display = "none";
          return;
        }

        renderMoviesList(movies);

        if (nowPage === totalPages) {
          moreButton.style.display = "none";
        } else {
          moreButton.style.display = "block";
        }
      } catch (error) {
        console.error("검색 중 에러:", error);
        alert("검색 중 문제가 발생했어요");
        moreButton.style.display = "none";
      } finally {
        removeSkeleton();
      }
    });
  }
}

export default SearchForm;
