import { removeSkeleton, renderSkeleton } from "../render/skeleton";
import { renderMoviesList } from "../render/movieList";
import { fetchSearchedMovies } from "../api/fetchMovies";
import { createNotFoundElement } from "../render/createNotFoundElement";
import PageStore from "../store";
import MoreButton from "./moreButton";

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

  constructor(private moreButton: MoreButton) {
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
    this.#search.form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  private async handleSubmit() {
    const searchValue = this.#search.input.value.trim();

    if (!searchValue) {
      return;
    }

    PageStore.setSearchMode(searchValue);
    this.prepareSearchView(searchValue);

    try {
      renderSkeleton();

      const { movies, nowPage, totalPages } = await fetchSearchedMovies(
        1,
        searchValue,
      );

      PageStore.setPagination(nowPage, totalPages);

      if (movies.length === 0) {
        this.renderEmptyResult();
        return;
      }

      renderMoviesList(movies, { append: false });
      this.moreButton.syncVisibility();
    } catch (error) {
      this.handleSearchError(error);
    } finally {
      removeSkeleton();
    }
  }

  private prepareSearchView(searchValue: string) {
    this.#view.backgroundContainer.style.display = "none";
    this.#view.sectionTitle.textContent = `"${searchValue}" 검색 결과`;
    this.#view.thumbnailList.replaceChildren();
    this.removeNotFoundContainer();
  }

  private renderEmptyResult() {
    const empty = createNotFoundElement();
    this.#view.sectionContainer.appendChild(empty);
    this.moreButton.hide();
  }

  private removeNotFoundContainer() {
    const notSearchFoundContainer = document.querySelector(
      ".not-search-found-container",
    );
    notSearchFoundContainer?.remove();
  }

  private handleSearchError(error: unknown) {
    console.error("검색 중 에러:", error);
    alert("검색 중 문제가 발생했어요");
    this.moreButton.hide();
  }
}

export default SearchForm;
