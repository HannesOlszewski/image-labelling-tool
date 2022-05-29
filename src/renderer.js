function getCurrentImagesPath() {
  return document.getElementById("images-path").value;
}

function setDisplayedImage(imageName) {
  const basePath = getCurrentImagesPath();

  if (
    !basePath ||
    basePath.length === 0 ||
    !imageName ||
    imageName.length === 0
  ) {
    return;
  }

  const imageElement = document.getElementById("displayed-image");

  imageElement.src = `app://${basePath}/${imageName}`;
  imageElement.className = imageElement.className.replace(
    "invisible",
    "visible"
  );

  const imageNameElement = document.getElementById("displayed-image-name");
  imageNameElement.innerText = imageName;
}

async function fillImageList() {
  const path = getCurrentImagesPath();

  if (!path) {
    return;
  }

  const images = (await window.api.getImagesList(path)) ?? [];
  const imagesList = document.getElementById("images-list");
  imagesList.innerHTML = "";

  images.forEach((image) => {
    const imageItem = document.createElement("li");

    imageItem.innerHTML = image;
    imageItem.className =
      "w-full px-4 py-2 font-medium text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white first:rounded-t-lg last:rounded-b-lg last:border-none dark:last:border-none";
    imageItem.id = image;

    imageItem.addEventListener("click", () => {
      setDisplayedImage(image);
    });

    imagesList.appendChild(imageItem);
  });

  if (images.length === 0) {
    const emptyItem = document.createElement("li");

    emptyItem.innerHTML = "No images found";
    emptyItem.className =
      "w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 first:rounded-t-lg last:rounded-b-lg last:border-none dark:last:border-none";
    emptyItem.id = "empty-item";

    imagesList.appendChild(emptyItem);
  }
}

document
  .getElementById("images-path-select")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    document.getElementById("images-path").value =
      await window.api.selectImagesPath();
    await fillImageList();
  });

window.addEventListener("load", async () => {
  document.getElementById("images-path").value =
    await window.api.getImagesPath();
  await fillImageList();
});

function handleKeyPress(event) {
  const numericKey = Number.parseInt(event.key);

  if (Number.isInteger(numericKey) && numericKey >= 1 && numericKey <= 9) {
    const classElement = document.getElementById(
      `checkbox-class-${numericKey}`
    );

    if (classElement) {
      classElement.checked = !classElement.checked;
    }
  }
}

window.addEventListener("keyup", handleKeyPress, true);
