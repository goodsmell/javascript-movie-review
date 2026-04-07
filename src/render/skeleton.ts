export const renderSkeleton = () => {
  const thumbnailList = document.querySelector(".thumbnail-list");
  const fragment = new DocumentFragment();
  const skeleton = document.createElement("div");
  skeleton.className = "movie-skeleton";

  for (let i = 0; i < 20; i++) {
    const newNode = skeleton.cloneNode(true);
    fragment.appendChild(newNode);
  }

  if (!thumbnailList) {
    throw new Error("thumbnail-list 요소를 찾을 수 없습니다.");
  }
  thumbnailList.appendChild(fragment);
};

export const removeSkeleton = () => {
  const skeletonNodes = document.querySelectorAll(".movie-skeleton");
  skeletonNodes.forEach((node) => node.remove());
};
