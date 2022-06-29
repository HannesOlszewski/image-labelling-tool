import React, { useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Image } from './util';
import Button from './components/Button';

export interface IElectronAPI {
  selectImagesPath: () => Promise<string>;
  getImagesPath: () => Promise<string>;
  getImagesList: () => Promise<string[]>;
  getLabelledImages: () => Promise<Image[]>;
  setLabelsForImage: (image: string, labels: number[]) => Promise<Image[]>;
}

declare global {
  interface Window {
    api?: IElectronAPI;
  }
}

function getCurrentImagesPath() {
  return (document.getElementById('images-path') as HTMLInputElement | null)
    .value;
}

async function setDisplayedImage(imageName: string) {
  const basePath = getCurrentImagesPath();

  if (
    !basePath
    || basePath.length === 0
    || !imageName
    || imageName.length === 0
  ) {
    return;
  }

  const imageElement = document.getElementById(
    'displayed-image',
  ) as HTMLImageElement | null;

  imageElement.src = `app://${basePath}/${imageName}`;
  imageElement.className = imageElement.className.replace(
    'invisible',
    'visible',
  );

  const imageNameElement = document.getElementById('displayed-image-name');
  imageNameElement.innerText = imageName;

  const labelledImages: Image[] = (await window.api.getLabelledImages()) ?? [];
  const labels = labelledImages.find((labelledImage) => labelledImage.path === imageName)
    ?.labels ?? [];

  for (let i = 1; i <= 9; i += 1) {
    const classElement = document.getElementById(
      `checkbox-class-${i}`,
    ) as HTMLInputElement | null;
    classElement.checked = labels.includes(i);
  }
}

async function fillImageList() {
  const images: string[] = (await window.api.getImagesList()) ?? [];
  const labelledImages: Image[] = (await window.api.getLabelledImages()) ?? [];
  const imagesList = document.getElementById(
    'images-list',
  ) as HTMLDivElement | null;
  imagesList.innerHTML = '';

  images.forEach((image) => {
    const imageItem = document.createElement('li');
    const imageNameItem = document.createElement('span');
    imageNameItem.textContent = image;

    imageItem.appendChild(imageNameItem);

    imageItem.className = 'w-full px-4 py-2 font-medium text-left border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white first:rounded-t-lg last:rounded-b-lg last:border-none dark:last:border-none';
    imageItem.id = image;

    const badgeItem = document.createElement('span');
    badgeItem.className = 'text-xs font-semibold px-2.5 py-0.5 rounded ml-2';

    const labelledImage = labelledImages.find((li) => li.path === image);

    if (labelledImage) {
      if (labelledImage.labels.length === 0) {
        badgeItem.textContent = 'No labels';
      } else {
        badgeItem.textContent = `${labelledImage.labels.length} label${
          labelledImage.labels.length > 1 ? 's' : ''
        }`;
      }

      badgeItem.className
        += ' bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300';
    } else {
      badgeItem.textContent = 'Unlabelled';
      badgeItem.className
        += ' bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }

    imageItem.appendChild(badgeItem);

    imageItem.addEventListener('click', () => {
      setDisplayedImage(image);
    });

    imagesList.appendChild(imageItem);
  });

  if (images.length === 0) {
    const emptyItem = document.createElement('li');

    emptyItem.innerHTML = 'No images found';
    emptyItem.className = 'w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 first:rounded-t-lg last:rounded-b-lg last:border-none dark:last:border-none';
    emptyItem.id = 'empty-item';

    imagesList.appendChild(emptyItem);
  }
}

async function displayNextImage() {
  const imageName = document.getElementById('displayed-image-name').innerText;
  const images = (await window.api.getImagesList()) ?? [];
  const imageIndex = images.indexOf(imageName);
  const nextImage = imageIndex < images.length - 1 ? images[imageIndex + 1] : images[0];
  await setDisplayedImage(nextImage);
}

async function displayPreviousImage() {
  const imageName = document.getElementById('displayed-image-name').innerText;
  const images = (await window.api.getImagesList()) ?? [];
  const imageIndex = images.indexOf(imageName);
  const previousImage = imageIndex > 0 ? images[imageIndex - 1] : images[images.length - 1];
  await setDisplayedImage(previousImage);
}

function App() {
  useEffect(() => {
    window.api?.getImagesPath().then((value) => {
      (
        document.getElementById('images-path') as HTMLInputElement | null
      ).value = value;
      fillImageList();
    });
  }, [window.api]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const numericKey = Number.parseInt(event.key, 10);

      if (Number.isInteger(numericKey) && numericKey >= 1 && numericKey <= 9) {
        const classElement = document.getElementById(
          `checkbox-class-${numericKey}`,
        ) as HTMLInputElement | null;

        if (classElement) {
          classElement.checked = !classElement.checked;
        }
      }
    },
    [],
  );

  const handleImagesPathSelectClick = useCallback(async () => {
    (document.getElementById('images-path') as HTMLInputElement | null).value = await window.api.selectImagesPath();
    await fillImageList();
  }, [window.api, fillImageList]);

  const handleSaveAndNextClick = useCallback(async () => {
    const imageName = document.getElementById('displayed-image-name').innerText;
    const imageClasses = [];

    for (let i = 1; i <= 9; i += 1) {
      const classElement = document.getElementById(
        `checkbox-class-${i}`,
      ) as HTMLInputElement | null;

      if (classElement.checked) {
        imageClasses.push(i);
      }
    }

    await window.api.setLabelsForImage(imageName, imageClasses);
    await fillImageList();
    await displayNextImage();
  }, [window.api, fillImageList, displayNextImage]);

  return (
    <div
      id="app"
      className="flex flex-row h-screen bg-slate-100 dark:bg-slate-900"
      onKeyUp={handleKeyPress}
    >
      <div className="flex flex-col gap-4 py-8 pl-8 pr-4 basis-1/3">
        <div className="flex flex-row items-end gap-2">
          <div className="w-full">
            <label
              htmlFor="images-path"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Path to images
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                name="images-path"
                id="images-path"
                className="focus:ring-blue-300 focus:border-blue-300 block w-full px-5 sm:text-sm bg-slate-50 border-gray-300 rounded-md cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Select path to images..."
                disabled
                readOnly
              />
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleImagesPathSelectClick}
            id="images-path-select"
          >
            Choose
          </Button>
        </div>
        <div className="overflow-hidden w-full rounded-lg">
          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Images
          </span>
          <ul
            className="w-full h-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white overflow-auto"
            id="images-list"
          >
            <li className="w-full px-4 py-2 border-b border-gray-200 dark:border-gray-600 first:rounded-t-lg last:rounded-b-lg last:border-none dark:last:border-none">
              No images found
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col py-8 pr-8 pl-4 gap-4 basis-2/3">
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Current image
          </span>
          <div className="flex flex-col p-4 gap-4 font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white grow">
            <h3 className="text-2xl" id="displayed-image-name">
              No image selected
            </h3>
            <div className="flex items-center w-full h-full">
              <img
                className="w-full h-96 object-scale-down invisible"
                src=""
                alt="The current image"
                id="displayed-image"
              />
            </div>
          </div>
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Labels
          </span>
          <div className="p-4 font-medium text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <fieldset className="flex flex-row gap-4">
              <legend className="sr-only">Classes</legend>

              <div className="flex items-center">
                <input
                  id="checkbox-class-1"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-1"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Amaretto
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-2"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-2"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Aria
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-3"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-3"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Chick Pea
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-4"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-4"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Espresso
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-5"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-5"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Lucifer
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-6"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-6"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Oreo
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-7"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-7"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Popcorn
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-8"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-8"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Pumpkin
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="checkbox-class-9"
                  type="checkbox"
                  value=""
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor="checkbox-class-9"
                  className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Whiskey
                </label>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="flex flex-row justify-end gap-4">
          <Button
            variant="secondary"
            onClick={displayPreviousImage}
            id="previous-image"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={displayNextImage}
            id="next-image"
          >
            Next
          </Button>
          <Button
            variant="primary"
            id="save-image"
            onClick={handleSaveAndNextClick}
          >
            Save and next
          </Button>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
