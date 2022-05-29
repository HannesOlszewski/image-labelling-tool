console.log(window.api);

window.addEventListener("load", function () {
  const titleElement = document.getElementById("title");
  titleElement.innerText = `Hello, ${window.api.name}!`;
});
