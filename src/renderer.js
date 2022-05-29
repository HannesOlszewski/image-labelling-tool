function getCurrentImagesPath() {
  return document.getElementById("images-path").value;
}

async function setDisplayedImage(imageName) {
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

  const labelledImages = (await window.api.getLabelledImages()) ?? [];
  const labels =
    labelledImages.find((labelledImage) => labelledImage.path === imageName)
      ?.labels ?? [];

  for (let i = 1; i <= 9; i++) {
    const classElement = document.getElementById(`checkbox-class-${i}`);
    classElement.checked = labels.includes(i);
  }
}

async function fillImageList() {
  const images = (await window.api.getImagesList()) ?? [];
  const labelledImages = (await window.api.getLabelledImages()) ?? [];
  const imagesList = document.getElementById("images-list");
  imagesList.innerHTML = "";

  images.forEach((image) => {
    const imageItem = document.createElement("li");
    const imageNameItem = document.createElement("span");
    imageNameItem.textContent = image;

    imageItem.appendChild(imageNameItem);

    imageItem.className =
      "w-full px-4 py-2 font-medium text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white first:rounded-t-lg last:rounded-b-lg last:border-none dark:last:border-none";
    imageItem.id = image;

    const badgeItem = document.createElement("span");
    badgeItem.className = "text-xs font-semibold px-2.5 py-0.5 rounded ml-2";

    const labelledImage = labelledImages.find(
      (labelledImage) => labelledImage.path === image
    );

    if (labelledImage) {
      if (labelledImage.labels.length === 0) {
        badgeItem.textContent = "No labels";
      } else {
        badgeItem.textContent = `${labelledImage.labels.length} label${
          labelledImage.labels.length > 1 ? "s" : ""
        }`;
      }

      console.log(labelledImage);

      badgeItem.className +=
        " bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300";
    } else {
      badgeItem.textContent = "Unlabelled";
      badgeItem.className +=
        " bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }

    imageItem.appendChild(badgeItem);

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

document.getElementById("save-image").addEventListener("click", async () => {
  const imageName = document.getElementById("displayed-image-name").innerText;
  const imageClasses = [];

  for (let i = 1; i <= 9; i++) {
    const classElement = document.getElementById(`checkbox-class-${i}`);

    if (classElement.checked) {
      imageClasses.push(i);
    }
  }

  await window.api.setLabelsForImage(imageName, imageClasses);
  await fillImageList();
  const images = (await window.api.getImagesList()) ?? [];
  const imageIndex = images.indexOf(imageName);
  const nextImage =
    imageIndex < images.length - 1 ? images[imageIndex + 1] : images[0];
  await setDisplayedImage(nextImage);
});
