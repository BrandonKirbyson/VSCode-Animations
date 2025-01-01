// Based off this: https://github.com/qwreey75/dotfiles/tree/master/vscode/trailCursorEffect, but with some modifications and all converted to typescript

/**
 * The options for the cursor animation
 */
interface CursorOptions {
  color: string;
  cursorStyle: "block" | "line";
  trailLength: number;
}

/**
 * The class for the cursor animation
 */
export class CursorAnimation {
  /**
   * The options for the cursor animation
   */
  private _options: CursorOptions;

  /**
   * The canvas element for the cursor animation
   */
  private _cursorCanvas: HTMLCanvasElement = document.createElement("canvas");

  /**
   * The handler for the cursor animation
   */
  private _cursorHandle!: {
    updateParticles: () => void;
    move: (x: number, y: number) => void;
    updateSize: (x: number, y: number) => void;
    updateCursorSize: (newSize: number, newSizeY: number) => void;
    stop: () => void;
  };

  private _interval: NodeJS.Timer | null = null;

  /**
   * The constructor for the cursor animation
   * @param options The options for the cursor animation
   */
  constructor(options: Partial<CursorOptions>) {
    // Set the options or use the default options
    this._options = {
      color: options?.color || "#ffffff",
      cursorStyle: options?.cursorStyle || "block",
      trailLength: options?.trailLength || 8,
    };

    this.init();
  }

  private getColor(): string {
    if (this._options.color.startsWith("--")) {
      return getComputedStyle(
        document.querySelector(".monaco-workbench") as HTMLElement
      ).getPropertyValue(this._options.color);
    }
    return this._options.color;
  }

  /**
   * Update the options for the cursor animation
   * @param options The options for the cursor animation
   */
  public updateOptions(options: Partial<CursorOptions>) {
    this._options.color = options?.color || this._options.color;
    this._options.cursorStyle =
      options?.cursorStyle || this._options.cursorStyle;
    this._options.trailLength =
      options?.trailLength || this._options.trailLength;
  }

  /**
   * Destroy the cursor animation
   */
  public destroy() {
    this._cursorHandle.stop();
    //@ts-ignore
    this._cursorHandle = null;

    this._cursorCanvas.remove();
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
  }

  private init() {
    this.createCursorHandler({
      // When editor instance stared
      onStarted: (editor: Element) => {
        // create new canvas for make animation
        this._cursorCanvas.style.pointerEvents = "none";
        this._cursorCanvas.style.position = "absolute";
        this._cursorCanvas.style.top = "0px";
        this._cursorCanvas.style.left = "0px";
        this._cursorCanvas.style.zIndex = "1000";
        editor.appendChild(this._cursorCanvas);

        this._cursorHandle = this.createTrail({
          length: this._options.trailLength,
          color: this._options.color,
          size: 7,
          style: this._options.cursorStyle,
          canvas: this._cursorCanvas,
        });
      },

      onReady: () => {},

      // when cursor moved
      onCursorPositionUpdated: (x: number, y: number) => {
        this._cursorHandle.move(x, y);
      },

      // when editor view size changed
      onEditorSizeUpdated: (x: number, y: number) => {
        this._cursorHandle.updateSize(x, y);
      },

      // when cursor size changed (emoji, ...)
      onCursorSizeUpdated: (x: number, y: number) => {
        this._cursorHandle.updateCursorSize(x, y);
        // this._cursorHandle.updateCursorSize(parseInt(y/lineHeight))
      },

      // when using multi cursor... just hide all
      onCursorVisibilityChanged: (visible: boolean) => {
        this._cursorCanvas.style.visibility = visible ? "visible" : "hidden";
      },

      // update animation
      onLoop: () => {
        this._cursorHandle.updateParticles();
      },
    });
  }

  private createTrail(options: {
    length: number;
    color?: string;
    size: number;
    style: string;
    canvas: HTMLCanvasElement;
    sizeY?: number;
  }) {
    const canvas = options?.canvas;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    let cursor = { x: 0, y: 0 };
    let particles: Particle[] = [];
    let width: number, height: number;
    let sizeX = options?.size || 3;
    let sizeY = options?.sizeY || sizeX * 2.2;
    let cursorsInitted = false;

    // update canvas size
    function updateSize(x: number, y: number) {
      width = x;
      height = y;
      canvas.width = x;
      canvas.height = y;
    }

    // update cursor position
    const move = (x: number, y: number) => {
      x = x + sizeX / 2;
      cursor.x = x;
      cursor.y = y;
      if (cursorsInitted === false) {
        cursorsInitted = true;
        for (let i = 0; i < this._options.trailLength; i++) {
          addParticle(x, y);
        }
      }
    };

    // particle class
    class Particle {
      private _position: { x: number; y: number };

      constructor(x: number, y: number) {
        this._position = { x: x, y: y };
      }

      get position() {
        return this._position;
      }
    }

    function addParticle(x: number, y: number) {
      particles.push(new Particle(x, y));
    }

    function calculatePosition() {
      let x = cursor.x,
        y = cursor.y;

      for (const particleIndex in particles) {
        const nextParticlePos = (particles[+particleIndex + 1] || particles[0])
          .position;
        const particlePos = particles[+particleIndex].position;

        particlePos.x = x;
        particlePos.y = y;

        x += (nextParticlePos.x - particlePos.x) * 0.42;
        y += (nextParticlePos.y - particlePos.y) * 0.35;
      }
    }

    // for block cursor
    const drawLines = () => {
      context.beginPath();
      context.lineJoin = "round";
      context.strokeStyle = this.getColor();
      const lineWidth = Math.min(sizeX, sizeY);
      context.lineWidth = lineWidth;

      // draw 3 lines
      let ymut = (sizeY - lineWidth) / 3;
      for (let yoffset = 0; yoffset <= 3; yoffset++) {
        let offset = yoffset * ymut;
        for (
          let particleIndex = 0;
          particleIndex < this._options.trailLength;
          particleIndex++
        ) {
          if (!particles[particleIndex]) continue;
          const pos = particles[particleIndex].position;
          if (particleIndex === 0) {
            context.moveTo(pos.x, pos.y + offset + lineWidth / 2);
          } else {
            context.lineTo(pos.x, pos.y + offset + lineWidth / 2);
          }
        }
      }
      context.stroke();
    };

    // for line cursor
    const drawPath = () => {
      context.beginPath();
      context.fillStyle = this.getColor();

      // draw path
      for (
        let particleIndex = 0;
        particleIndex < this._options.trailLength;
        particleIndex++
      ) {
        if (!particles[particleIndex]) continue;
        const pos = particles[+particleIndex].position;
        if (particleIndex === 0) {
          context.moveTo(pos.x, pos.y);
        } else {
          context.lineTo(pos.x, pos.y);
        }
      }
      for (
        let particleIndex = this._options.trailLength - 1;
        particleIndex >= 0;
        particleIndex--
      ) {
        if (!particles[particleIndex]) continue;
        const pos = particles[+particleIndex].position;
        context.lineTo(pos.x, pos.y + sizeY);
      }
      context.closePath();
      context.fill();

      context.beginPath();
      context.lineJoin = "round";
      context.strokeStyle = this.getColor();
      context.lineWidth = Math.min(sizeX, sizeY);
      // for up&down
      let offset = -sizeX / 2 + sizeY / 2;
      for (
        let particleIndex = 0;
        particleIndex < this._options.trailLength;
        particleIndex++
      ) {
        if (!particles[particleIndex]) continue;
        const pos = particles[particleIndex].position;
        if (particleIndex === 0) {
          context.moveTo(pos.x, pos.y + offset);
        } else {
          context.lineTo(pos.x, pos.y + offset);
        }
      }
      context.stroke();
    };

    const updateParticles = () => {
      if (!cursorsInitted) return;

      context.clearRect(0, 0, width, height);
      calculatePosition();

      //Draw cursor
      if (this._options.cursorStyle === "block") {
        drawPath();
      } else {
        drawLines();
      }
    };

    function updateCursorSize(newSize: number, newSizeY: number) {
      sizeX = newSize;
      if (newSizeY) sizeY = newSizeY;
    }

    function stop() {
      // cursorsInitted = false;
      particles = [];
      context.clearRect(0, 0, width, height);
    }

    return {
      updateParticles: updateParticles,
      move: move,
      updateSize: updateSize,
      updateCursorSize: updateCursorSize,
      stop: stop,
    };
  }

  private async createCursorHandler(handlerFunctions: {
    onStarted: (editor: HTMLElement) => void;
    onReady: () => void;
    onCursorPositionUpdated: (x: number, y: number) => void;
    onEditorSizeUpdated: (x: number, y: number) => void;
    onCursorSizeUpdated: (x: number, y: number) => void;
    onCursorVisibilityChanged: (visible: boolean) => void;
    onLoop: () => void;
  }) {
    //Wait for editor to load
    let editor: HTMLElement | null = null;
    while (!editor) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      editor = document.querySelector(".part.editor");
    }
    handlerFunctions?.onStarted(editor);

    // cursor cache
    let updateHandlers: {
      (editorX: number, editorY: number): void;
      (editorX: number, editorY: number): void;
    }[] = [];
    let cursorId = 0;
    let lastObjects: HTMLElement[] = [];
    let lastCursor = 0;

    // cursor update handler
    function createCursorUpdateHandler(
      target: HTMLElement,
      cursorId: number,
      cursorHolder: HTMLElement,
      minimap: HTMLElement
    ) {
      let lastX: number, lastY: number; // save last position
      let update = (editorX: number, editorY: number) => {
        // If cursor was destroyed, remove update handler
        if (!lastObjects[cursorId]) {
          updateHandlers.splice(updateHandlers.indexOf(update), 1);
          return;
        }

        // get cursor position
        let { left: newX, top: newY } = target.getBoundingClientRect();
        let revX = newX - editorX,
          revY = newY - editorY;

        // if have no changes, ignore
        if (revX === lastX && revY === lastY && lastCursor === cursorId) return;
        lastX = revX;
        lastY = revY; // update last position

        // wrong position
        if (revX <= 0 || revY <= 0) return;

        // if it is invisible, ignore
        if (target.style.visibility !== "inherit") return;

        // if moved over minimap, ignore
        // if (minimap && minimap.getBoundingClientRect().left <= newX) return;

        // if cursor is not displayed on screen, ignore
        if (cursorHolder.getBoundingClientRect().left > newX) return;

        // update corsor position
        lastCursor = cursorId;
        handlerFunctions?.onCursorPositionUpdated(revX, revY);
        handlerFunctions?.onCursorSizeUpdated(
          target.clientWidth,
          target.clientHeight
        );
      };
      updateHandlers.push(update);
    }

    // handle cursor create/destroy event (using polling, due to event handlers are LAGGY)
    let lastVisibility = false;
    this._interval = setInterval(async () => {
      let now: number[] = [],
        count = 0;

      const cursors = (editor as HTMLElement).querySelectorAll(
        ".cursor"
      ) as NodeListOf<HTMLElement>;
      // created
      for (let i = 0; i < cursors.length; i++) {
        const target = cursors[i];
        if (target.style.visibility !== "inherit") count++;
        if (target.hasAttribute("cursorId")) {
          now.push(Number(target.getAttribute("cursorId")));
          continue;
        }
        let thisCursorId = cursorId++;
        now.push(thisCursorId);
        lastObjects[thisCursorId] = target;
        target.setAttribute("cursorId", `${thisCursorId}`);
        let cursorHolder = target.parentElement?.parentElement?.parentElement;
        let minimap = cursorHolder?.parentElement?.querySelector(".minimap");
        createCursorUpdateHandler(
          target,
          thisCursorId,
          cursorHolder as HTMLElement,
          minimap as HTMLElement
        );
      }

      // Updated visibility
      let visibility = count <= 1;
      if (visibility !== lastVisibility) {
        handlerFunctions?.onCursorVisibilityChanged(visibility);
        lastVisibility = visibility;
      }

      // destroyed
      for (const id in lastObjects) {
        if (now.includes(+id)) continue;
        delete lastObjects[+id];
      }
    }, 500);

    // read cursor position polling
    const updateLoop = () => {
      if (!this._interval) {
        return;
      }
      let { left: editorX, top: editorY } = (
        editor as HTMLElement
      ).getBoundingClientRect();
      for (const handler of updateHandlers) handler(editorX, editorY);
      handlerFunctions?.onLoop();
      requestAnimationFrame(updateLoop);
    };

    // handle editor view size changed event
    function updateEditorSize() {
      handlerFunctions?.onEditorSizeUpdated(
        (editor as HTMLElement).clientWidth,
        (editor as HTMLElement).clientHeight
      );
    }
    const resizeObserver = new ResizeObserver(updateEditorSize);
    resizeObserver.observe(editor);
    updateEditorSize();

    // startup
    updateLoop();
    handlerFunctions?.onReady();
  }
}
