import "./style.css";

const APP_NAME = "Sick SketchPad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Create and add h1 element
const titleElement = document.createElement("h1");
titleElement.textContent = APP_NAME;
app.appendChild(titleElement);

// Create and add canvas element
const canvasElement = document.createElement("canvas");
canvasElement.width = 256;
canvasElement.height = 256;
canvasElement.id = "appCanvas";
app.appendChild(canvasElement);

// Set canvas background color to white
const ctx = canvasElement.getContext("2d");
if (ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
}

// Drawing logic
let drawing = false;

canvasElement.addEventListener("mousedown", () => {
  drawing = true;
});

canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  ctx?.beginPath();
});

canvasElement.addEventListener("mousemove", (event) => {
  if (!drawing) return;
  ctx?.lineTo(event.offsetX, event.offsetY);
  ctx?.stroke();
  ctx?.beginPath();
  ctx?.moveTo(event.offsetX, event.offsetY);
});

// Create and add clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  ctx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
  if (ctx) {
    ctx.fillStyle = "white";
  }
  ctx?.fillRect(0, 0, canvasElement.width, canvasElement.height);
});
app.appendChild(clearButton);