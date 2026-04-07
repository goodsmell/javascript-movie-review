class Logo {
  #logo;

  constructor(private onReset: () => void) {
    this.#logo = document.querySelector(".logo");
  }

  bindEvent() {
    this.#logo?.addEventListener("click", this.onReset);
  }
}

export default Logo;
