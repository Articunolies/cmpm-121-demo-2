// test

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

// DoodleLine class
class DoodleLine {
  private points: { x: number; y: number }[] = [];
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

// EmojiPreview class
class EmojiPreview {
  private x: number;
  private y: number;
  private emoji: string;
  private rotation: number;

  constructor(x: number, y: number, emoji: string, rotation: number) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.rotation = rotation;
  }

  updatePosition(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  updateRotation(rotation: number) {
    this.rotation = rotation;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = "32px Arial"; // Adjusted size
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

// Emoji class
class Emoji {
  private x: number;
  private y: number;
  private emoji: string;
  private rotation: number;

  constructor(x: number, y: number, emoji: string, rotation: number) {
    this.x = x;
    this.y = y;
    this.emoji = emoji;
    this.rotation = rotation;
  }

  drag(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = "32px Arial"; // Adjusted size
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

// Drawing logic
let drawing = false;
let lines: (DoodleLine | Emoji)[] = [];
let currentLine: DoodleLine | null = null;
let currentEmoji: Emoji | null = null;
let redoStack: (DoodleLine | Emoji)[] = [];
let currentThickness = 2; // Adjusted thin thickness
let toolPreview: ToolPreview | EmojiPreview | null = null;
let currentEmojiString: string | null = null;
let currentRotation = 0; // Default rotation

// Initial emoji array
const emojis = ["😀", "🎨", "✨"];
const customEmojis: string[] = [];

// Function to create emoji buttons
function createEmojiButton(emoji: string) {
  const button = document.createElement("button");
  button.textContent = emoji;
  button.addEventListener("click", () => {
    currentEmojiString = emoji;
    button.classList.add("selectedTool");
    thinButton.classList.remove("selectedTool");
    thickButton.classList.remove("selectedTool");
    emojiButtons.forEach((btn) => {
      if (btn !== button) btn.classList.remove("selectedTool");
    });
    canvasElement.dispatchEvent(new Event("tool-moved"));
  });
  return button;
}

// Create and add canvas event listeners
canvasElement.addEventListener("mousedown", (event) => {
  if (currentEmojiString) {
    currentEmoji = new Emoji(
      event.offsetX,
      event.offsetY,
      currentEmojiString,
      currentRotation,
    );
    lines.push(currentEmoji);
    toolPreview = null; // Hide tool preview when drawing
  } else {
    drawing = true;
    currentLine = new DoodleLine(
      event.offsetX,
      event.offsetY,
      currentThickness,
    );
    lines.push(currentLine);
    toolPreview = null; // Hide tool preview when drawing
  }
});

canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  currentLine = null;
  currentEmoji = null;
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

canvasElement.addEventListener("mousemove", (event) => {
  if (!drawing && ctx) {
    if (currentEmojiString) {
      if (!toolPreview) {
        toolPreview = new EmojiPreview(
          event.offsetX,
          event.offsetY,
          currentEmojiString,
          currentRotation,
        );
      } else {
        toolPreview.updatePosition(event.offsetX, event.offsetY);
      }
    } else {
      if (!toolPreview) {
        toolPreview = new ToolPreview(
          event.offsetX,
          event.offsetY,
          currentThickness,
        );
      } else {
        toolPreview.updatePosition(event.offsetX, event.offsetY);
      }
    }
    canvasElement.dispatchEvent(new Event("tool-moved"));
  } else if (drawing && currentLine) {
    currentLine.drag(event.offsetX, event.offsetY);
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  } else if (currentEmoji) {
    currentEmoji.drag(event.offsetX, event.offsetY);
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

// Create and add thin doodle tool button
const thinButton = document.createElement("button");
thinButton.textContent = "Thin Doodle";
thinButton.classList.add("selectedTool");
thinButton.addEventListener("click", () => {
  currentThickness = 2; // Adjusted thin thickness
  currentEmojiString = null;
  thinButton.classList.add("selectedTool");
  thickButton.classList.remove("selectedTool");
  emojiButtons.forEach((btn) => btn.classList.remove("selectedTool"));
});
app.appendChild(thinButton);

// Create and add thick doodle tool button
const thickButton = document.createElement("button");
thickButton.textContent = "Thick Doodle";
thickButton.addEventListener("click", () => {
  currentThickness = 8; // Adjusted thick thickness
  currentEmojiString = null;
  thickButton.classList.add("selectedTool");
  thinButton.classList.remove("selectedTool");
  emojiButtons.forEach((btn) => btn.classList.remove("selectedTool"));
});
app.appendChild(thickButton);

// Create and add emoji buttons
const emojiButtons: HTMLButtonElement[] = [];
emojis.forEach((emoji) => {
  const button = createEmojiButton(emoji);
  emojiButtons.push(button);
  app.appendChild(button);
});

// Create and add custom emoji button
const customEmojiButton = document.createElement("button");
customEmojiButton.textContent = "Custom Emoji";
customEmojiButton.addEventListener("click", () => {
  const customEmoji = prompt("Enter your custom emoji:", "😊");
  if (customEmoji) {
    customEmojis.push(customEmoji);
    const button = createEmojiButton(customEmoji);
    emojiButtons.push(button);
    app.appendChild(button);
  }
});
app.appendChild(customEmojiButton);

// Create and add rotation slider
const rotationSlider = document.createElement("input");
rotationSlider.type = "range";
rotationSlider.min = "0";
rotationSlider.max = "360";
rotationSlider.value = "0";
rotationSlider.addEventListener("input", (event) => {
  currentRotation = parseInt((event.target as HTMLInputElement).value, 10);
  if (toolPreview instanceof EmojiPreview) {
    toolPreview.updateRotation(currentRotation);
    canvasElement.dispatchEvent(new Event("tool-moved"));
  }
});
app.appendChild(rotationSlider);

// Create and add export button
const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.addEventListener("click", () => {
  // Create a new canvas of size 1024x1024
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;
  const exportCtx = exportCanvas.getContext("2d");

  if (exportCtx) {
    // Scale the context to 4x
    exportCtx.scale(4, 4);

    // Fill the background with white
    exportCtx.fillStyle = "white";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Execute all items on the display list
    for (const line of lines) {
      line.display(exportCtx);
    }

    // Trigger a file download with the contents of the canvas as a PNG file
    exportCanvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "sketchpad.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
});
app.appendChild(exportButton);
