class Logo {
  #logo;

  constructor() {
    this.#logo = document.querySelector(".logo");
  }

  bindEvent() {
    this.#logo?.addEventListener("click", () => {
      location.reload();
    });
  }
}

export default Logo;
