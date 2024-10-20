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

// MarkerLine class
class MarkerLine {
  private points: { x: number, y: number }[] = [];

  constructor(initialX: number, initialY: number) {
    this.points.push({ x: initialX, y: initialY });
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (const point of this.points) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
  }
}

// Drawing logic
let drawing = false;
let lines: MarkerLine[] = [];
let currentLine: MarkerLine | null = null;
let redoStack: MarkerLine[] = [];

canvasElement.addEventListener("mousedown", (event) => {
  drawing = true;
  currentLine = new MarkerLine(event.offsetX, event.offsetY);
  lines.push(currentLine);
});

canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  currentLine = null;
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

canvasElement.addEventListener("mousemove", (event) => {
  if (!drawing || !currentLine) return;
  currentLine.drag(event.offsetX, event.offsetY);
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

// Observer for "drawing-changed" event
canvasElement.addEventListener("drawing-changed", () => {
  if (ctx) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    for (const line of lines) {
      line.display(ctx);
    }
  }
});

// Create and add clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  lines = [];
  redoStack = [];
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});
app.appendChild(clearButton);

// Create and add undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    if (lastLine) {
      redoStack.push(lastLine);
    }
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  }
});
app.appendChild(undoButton);

// Create and add redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const lastRedoLine = redoStack.pop();
    if (lastRedoLine) {
      lines.push(lastRedoLine);
    }
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  }
});
app.appendChild(redoButton);