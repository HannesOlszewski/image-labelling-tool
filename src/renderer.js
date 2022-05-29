async function fillImageList() {
  const path = document.getElementById("images-path").value;

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
      console.log(image);
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
