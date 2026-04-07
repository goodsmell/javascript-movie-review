import { renderMoviesList, removeSkeleton, renderSkeleton } from "./render";
import { fetchSearchedMovies } from "./api/fetchMovies";
import { makeNotFoundContainer } from "./makeNotFoundContainer";

import PageStore from "./store";

class SearchForm {
  #search: {
    form: HTMLFormElement;
    input: HTMLInputElement;
  };

  #view: {
    backgroundContainer: HTMLDivElement;
    sectionContainer: HTMLElement;
    sectionTitle: HTMLElement;
    thumbnailList: HTMLElement;
  };

  constructor() {
    const form = document.querySelector<HTMLFormElement>(".search");
    const input = document.querySelector<HTMLInputElement>(".search-input");
    const backgroundContainer = document.querySelector<HTMLDivElement>(
      ".background-container",
    );
    const sectionContainer =
      document.querySelector<HTMLElement>(".section-container");
    const sectionTitle = document.querySelector<HTMLElement>(".section-title");
    const thumbnailList =
      document.querySelector<HTMLElement>(".thumbnail-list");

    if (
      !form ||
      !input ||
      !backgroundContainer ||
      !sectionContainer ||
      !sectionTitle ||
      !thumbnailList
    ) {
      throw new Error("필수 UI 요소를 찾을 수 없습니다.");
    }

    this.#search = { form, input };
    this.#view = {
      backgroundContainer,
      sectionContainer,
      sectionTitle,
      thumbnailList,
    };
  }

  bindEvent() {
    const moreButton: HTMLButtonElement | null =
      document.querySelector(".more-button");

    if (!moreButton) throw new Error("more-button 요소를 찾을 수 없습니다.");

    this.#search.form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const searchValue = this.#search.input?.value ?? "";

      PageStore.mode = "search";
      PageStore.query = searchValue;
      PageStore.page = 1;

      this.#view.backgroundContainer.style.display = "none";
      this.#view.sectionTitle.textContent = `"${searchValue}" 검색 결과`;
      this.#view.thumbnailList.replaceChildren();

      const notSearchFoundContainer = document.querySelector(
        ".not-search-found-container",
      );
      notSearchFoundContainer?.remove();

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
          this.#view.sectionContainer.appendChild(empty);
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
