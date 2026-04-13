import fallbackImg from "../assets/movie_fallback_image.svg";

class Modal {
  #modal: HTMLDivElement;
  #closeBtn: HTMLButtonElement;
  #description: {
    title: HTMLHeadingElement;
    category: HTMLParagraphElement;
    rate: HTMLSpanElement;
    detail: HTMLParagraphElement;
    image: HTMLImageElement;
  };

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
    this.#description = { title, category, rate, detail, image };
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
    const { title, category, rate, detail, image } = this.#description;

    title.textContent = movie.title;
    category.textContent = movie.categoryText;
    rate.textContent = movie.voteAverage.toString();
    detail.textContent = movie.overview;
    image.alt = movie.title;

    image.style.opacity = "0";
    image.onload = null;
    image.onerror = null;

    image.onload = () => {
      image.style.opacity = "1";
    };

    image.onerror = () => {
      image.onerror = null;
      image.src = fallbackImg;
      image.style.opacity = "1";
    };

    image.src = movie.posterPath;
  }

  openEmpty() {
    const { title, category, rate, detail, image } = this.#description;

    title.textContent = "";
    category.textContent = "";
    rate.textContent = "";
    detail.textContent = "";
    image.style.opacity = "0";
    this.#modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  close() {
    this.#modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

export default Modal;
