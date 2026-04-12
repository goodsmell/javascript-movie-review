import { RatingStorage } from "../storage/RatingStorage";

const RATING_LABELS: Record<number, string> = {
  0: "",
  1: "최악이에요",
  2: "별로예요",
  3: "보통이에요",
  4: "좋아요",
  5: "명작이에요",
};

class Review {
  #stars: NodeListOf<HTMLButtonElement>;
  #scoreEl: HTMLSpanElement;
  #labelEl: HTMLElement;
  #selectedRating = 0;
  #movieId = 0;
  #storage: RatingStorage;

  constructor(storage: RatingStorage) {
    const stars = document.querySelectorAll<HTMLButtonElement>(".rating-star");
    const scoreEl = document.querySelector<HTMLSpanElement>(".rating-score");
    const labelEl = document.querySelector<HTMLElement>(".rating-text");

    if (!stars.length || !scoreEl || !labelEl) {
      throw new Error("별점 요소를 찾을 수 없습니다.");
    }

    this.#stars = stars;
    this.#scoreEl = scoreEl;
    this.#labelEl = labelEl;
    this.#storage = storage;
  }

  load(movieId: number) {
    this.#movieId = movieId;
    this.#selectedRating = this.#storage.get(movieId);
    this.#renderStars(this.#selectedRating);
    this.#updateText(this.#selectedRating);
  }

  bindEvent() {
    this.#stars.forEach((star) => {
      star.addEventListener("click", () => {
        this.#selectedRating = Number(star.dataset.value);
        this.#storage.save(this.#movieId, this.#selectedRating);
        this.#renderStars(this.#selectedRating);
        this.#updateText(this.#selectedRating);
      });

      star.addEventListener("mouseover", () => {
        this.#renderStars(Number(star.dataset.value));
      });
    });

    document
      .querySelector(".rating-stars")
      ?.addEventListener("mouseleave", () => {
        this.#renderStars(this.#selectedRating);
      });
  }

  #renderStars(rating: number) {
    this.#stars.forEach((star) => {
      const value = Number(star.dataset.value);
      star.classList.toggle("filled", value <= rating);
    });
  }

  #updateText(rating: number) {
    this.#scoreEl.textContent = `(${rating * 2}/10)`;
    this.#labelEl.firstChild!.textContent = RATING_LABELS[rating] + " ";
  }
}

export default Review;
