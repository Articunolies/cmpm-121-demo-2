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
let lines: { x: number, y: number }[][] = [];
let currentLine: { x: number, y: number }[] = [];

canvasElement.addEventListener("mousedown", () => {
  drawing = true;
  currentLine = [];
  lines.push(currentLine);
});

canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

canvasElement.addEventListener("mousemove", (event) => {
  if (!drawing) return;
  const point = { x: event.offsetX, y: event.offsetY };
  currentLine.push(point);
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

// Observer for "drawing-changed" event
canvasElement.addEventListener("drawing-changed", () => {
  if (ctx) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.beginPath();
    for (const line of lines) {
      if (line.length > 0) {
        ctx.moveTo(line[0].x, line[0].y);
        for (const point of line) {
          ctx.lineTo(point.x, point.y);
        }
      }
    }
    ctx.stroke();
  }
});

// Create and add clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  lines = [];
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});
app.appendChild(clearButton);