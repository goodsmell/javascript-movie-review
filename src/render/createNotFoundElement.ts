import searchNotFoundIcon from "../assets/searchNotFoundIcon.png";

export const createNotFoundElement = () => {
  const notSearchFoundContainer = document.createElement("div");
  const notSearchFoundImg = document.createElement("img");
  const notSearchFoundText = document.createElement("h2");

  notSearchFoundContainer.className = "not-search-found-container";
  notSearchFoundImg.className = "not-search-found-img";
  notSearchFoundText.className = "not-search-found-text";
  notSearchFoundImg.src = searchNotFoundIcon;
  notSearchFoundText.textContent = "검색 결과가 없습니다.";
  notSearchFoundContainer.appendChild(notSearchFoundImg);
  notSearchFoundContainer.appendChild(notSearchFoundText);

  return notSearchFoundContainer;
};
