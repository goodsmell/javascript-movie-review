class Modal {
  #modal: HTMLDivElement;
  #closeBtn: HTMLButtonElement;
  #title: HTMLHeadingElement;
  #category: HTMLParagraphElement;
  #rate: HTMLSpanElement;
  #detail: HTMLParagraphElement;
  #image: HTMLImageElement;

  constructor() {
    const modal = document.querySelector<HTMLDivElement>(".modal-background");
    const closeBtn = document.querySelector<HTMLButtonElement>(".close-modal");
    const title = document.querySelector<HTMLHeadingElement>(
      ".modal-description h2",
    );
    const category = document.querySelector<HTMLParagraphElement>(
      ".modal-description .category",
    );
    const rate = document.querySelector<HTMLSpanElement>(
      ".modal-description .rate span",
    );
    const detail = document.querySelector<HTMLParagraphElement>(
      ".modal-description .detail",
    );
    const image = document.querySelector<HTMLImageElement>(".modal-image img");

    if (
      !modal ||
      !closeBtn ||
      !title ||
      !category ||
      !rate ||
      !detail ||
      !image
    ) {
      throw new Error("모달 요소를 찾을 수 없습니다.");
    }

    this.#modal = modal;
    this.#closeBtn = closeBtn;
    this.#title = title;
    this.#category = category;
    this.#rate = rate;
    this.#detail = detail;
    this.#image = image;
  }

  bindEvent() {
    this.#closeBtn.addEventListener("click", () => this.close());

    this.#modal.addEventListener("click", (e) => {
      if (e.target === this.#modal) {
        this.close();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    });
  }

  fill(movie: {
    title: string;
    overview: string;
    voteAverage: number;
    posterPath: string;
    categoryText: string;
  }) {
    this.#title.textContent = movie.title;
    this.#category.textContent = movie.categoryText;
    this.#rate.textContent = movie.voteAverage.toString();
    this.#detail.textContent = movie.overview;
    this.#image.style.opacity = "0";
    this.#image.src = movie.posterPath;
    this.#image.onload = () => {
      this.#image.style.opacity = "1";
    };
    this.#image.alt = movie.title;
  }

  openEmpty() {
    this.#title.textContent = "";
    this.#category.textContent = "";
    this.#rate.textContent = "";
    this.#detail.textContent = "";
    this.#image.style.opacity = "0";
    this.#modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.#modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}
export default Modal;
