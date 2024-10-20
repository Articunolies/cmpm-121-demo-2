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
  private thickness: number;

  constructor(initialX: number, initialY: number, thickness: number) {
    this.points.push({ x: initialX, y: initialY });
    this.thickness = thickness;
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.beginPath();
      ctx.lineWidth = this.thickness;
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (const point of this.points) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.stroke();
    }
  }
}

// ToolPreview class
class ToolPreview {
  private x: number;
  private y: number;
  private thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.x = x;
    this.y = y;
    this.thickness = thickness;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.thickness / 2, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

// StickerPreview class
class StickerPreview {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Arial";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

// Sticker class
class Sticker {
  private x: number;
  private y: number;
  private sticker: string;

  constructor(x: number, y: number, sticker: string) {
    this.x = x;
    this.y = y;
    this.sticker = sticker;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.font = "24px Arial";
    ctx.fillText(this.sticker, this.x, this.y);
  }
}

// Drawing logic
let drawing = false;
let lines: (MarkerLine | Sticker)[] = [];
let currentLine: MarkerLine | null = null;
let currentSticker: Sticker | null = null;
let redoStack: (MarkerLine | Sticker)[] = [];
let currentThickness = 1; // Default to thin
let toolPreview: ToolPreview | StickerPreview | null = null;
let currentStickerEmoji: string | null = null;

canvasElement.addEventListener("mousedown", (event) => {
  if (currentStickerEmoji) {
    currentSticker = new Sticker(event.offsetX, event.offsetY, currentStickerEmoji);
    lines.push(currentSticker);
    toolPreview = null; // Hide tool preview when drawing
  } else {
    drawing = true;
    currentLine = new MarkerLine(event.offsetX, event.offsetY, currentThickness);
    lines.push(currentLine);
    toolPreview = null; // Hide tool preview when drawing
  }
});

canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  currentLine = null;
  currentSticker = null;
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

canvasElement.addEventListener("mousemove", (event) => {
  if (!drawing && ctx) {
    if (currentStickerEmoji) {
      if (!toolPreview) {
        toolPreview = new StickerPreview(event.offsetX, event.offsetY, currentStickerEmoji);
      } else {
        toolPreview.updatePosition(event.offsetX, event.offsetY);
      }
    } else {
      if (!toolPreview) {
        toolPreview = new ToolPreview(event.offsetX, event.offsetY, currentThickness);
      } else {
        toolPreview.updatePosition(event.offsetX, event.offsetY);
      }
    }
    canvasElement.dispatchEvent(new Event("tool-moved"));
  } else if (drawing && currentLine) {
    currentLine.drag(event.offsetX, event.offsetY);
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  } else if (currentSticker) {
    currentSticker.drag(event.offsetX, event.offsetY);
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  }
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

// Observer for "tool-moved" event
canvasElement.addEventListener("tool-moved", () => {
  if (ctx && toolPreview) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    for (const line of lines) {
      line.display(ctx);
    }
    toolPreview.display(ctx);
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

// Create and add thin marker tool button
const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.classList.add("selectedTool");
thinButton.addEventListener("click", () => {
  currentThickness = 1;
  currentStickerEmoji = null;
  thinButton.classList.add("selectedTool");
  thickButton.classList.remove("selectedTool");
  sticker1Button.classList.remove("selectedTool");
  sticker2Button.classList.remove("selectedTool");
  sticker3Button.classList.remove("selectedTool");
});
app.appendChild(thinButton);

// Create and add thick marker tool button
const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
thickButton.addEventListener("click", () => {
  currentThickness = 5;
  currentStickerEmoji = null;
  thickButton.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
  sticker1Button.classList.remove("selectedTool");
  sticker2Button.classList.remove("selectedTool");
  sticker3Button.classList.remove("selectedTool");
});
app.appendChild(thickButton);

// Create and add sticker buttons
const sticker1Button = document.createElement("button");
sticker1Button.textContent = "😀";
sticker1Button.addEventListener("click", () => {
  currentStickerEmoji = "😀";
  sticker1Button.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  sticker2Button.classList.remove("selectedTool");
  sticker3Button.classList.remove("selectedTool");
  canvasElement.dispatchEvent(new Event("tool-moved"));
});
app.appendChild(sticker1Button);

const sticker2Button = document.createElement("button");
sticker2Button.textContent = "🎉";
sticker2Button.addEventListener("click", () => {
  currentStickerEmoji = "🎉";
  sticker2Button.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  sticker1Button.classList.remove("selectedTool");
  sticker3Button.classList.remove("selectedTool");
  canvasElement.dispatchEvent(new Event("tool-moved"));
});
app.appendChild(sticker2Button);

const sticker3Button = document.createElement("button");
sticker3Button.textContent = "🌟";
sticker3Button.addEventListener("click", () => {
  currentStickerEmoji = "🌟";
  sticker3Button.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
  thickButton.classList.remove("selectedTool");
  sticker1Button.classList.remove("selectedTool");
  sticker2Button.classList.remove("selectedTool");
  canvasElement.dispatchEvent(new Event("tool-moved"));
});
app.appendChild(sticker3Button);