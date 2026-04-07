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
    moreButton: HTMLButtonElement;
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
    const moreButton =
      document.querySelector<HTMLButtonElement>(".more-button");

    if (
      !form ||
      !input ||
      !backgroundContainer ||
      !sectionContainer ||
      !sectionTitle ||
      !thumbnailList ||
      !moreButton
    ) {
      throw new Error("필수 UI 요소를 찾을 수 없습니다.");
    }

    this.#search = { form, input };
    this.#view = {
      backgroundContainer,
      sectionContainer,
      sectionTitle,
      thumbnailList,
      moreButton,
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

    this.updateSearchState(searchValue);
    this.prepareSearchView(searchValue);

    try {
      renderSkeleton();

      const { movies, nowPage, totalPages } = await fetchSearchedMovies(
        1,
        searchValue,
      );

      this.updatePagination(nowPage, totalPages);

      if (movies.length === 0) {
        this.renderEmptyResult();
        return;
      }

      renderMoviesList(movies);
      this.toggleMoreButton(nowPage < totalPages);
    } catch (error) {
      this.handleSearchError(error);
    } finally {
      removeSkeleton();
    }
  }

  private updateSearchState(searchValue: string) {
    PageStore.mode = "search";
    PageStore.query = searchValue;
    PageStore.page = 1;
  }

  private updatePagination(nowPage: number, totalPages: number) {
    PageStore.page = nowPage;
    PageStore.totalPages = totalPages;
  }

  private prepareSearchView(searchValue: string) {
    this.#view.backgroundContainer.style.display = "none";
    this.#view.sectionTitle.textContent = `"${searchValue}" 검색 결과`;
    this.#view.thumbnailList.replaceChildren();
    this.removeNotFoundContainer();
  }

  private renderEmptyResult() {
    const empty = makeNotFoundContainer();
    this.#view.sectionContainer.appendChild(empty);
    this.hideMoreButton();
  }

  private removeNotFoundContainer() {
    const notSearchFoundContainer = document.querySelector(
      ".not-search-found-container",
    );
    notSearchFoundContainer?.remove();
  }

  private toggleMoreButton(shouldShow: boolean) {
    if (shouldShow) {
      this.showMoreButton();
      return;
    }

    this.hideMoreButton();
  }

  private showMoreButton() {
    this.#view.moreButton.style.display = "block";
  }

  private hideMoreButton() {
    this.#view.moreButton.style.display = "none";
  }

  private handleSearchError(error: unknown) {
    console.error("검색 중 에러:", error);
    alert("검색 중 문제가 발생했어요");
    this.hideMoreButton();
  }
}

export default SearchForm;
