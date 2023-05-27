export interface MessengerData {
  settings: {
    cursorAnimation: {
      enabled: boolean;
      color: string;
      cursorType: "block" | "line";
      trailLength: number;
      updateRate: number;
    };
  };
  css: string;
}

export class Messenger {
  private _messengerElement!: HTMLElement | null;

  constructor(handlers: {
    onLoad: (data: MessengerData) => void;
    onUpdate: (data: MessengerData) => void;
  }) {
    const interval = setInterval(() => {
      this._messengerElement = document.getElementById(
        "BrandonKirbyson.vscode-animations"
      );

      const content = this._messengerElement?.getAttribute("aria-label");

      if (!this._messengerElement || content === "") return;

      clearInterval(interval); //Clear the interval

      handlers.onLoad(this.data);

      const observer = new MutationObserver((mutations: any) => {
        mutations.forEach((mutation: any) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "aria-label"
          ) {
            const newCSS = mutation.target.getAttribute("aria-label");
            if (newCSS) {
              console.log("VSCode-Animations: Updated CSS", this.data);
              handlers.onUpdate(this.data);
            }
          }
        });
      });
      observer.observe(this._messengerElement, {
        attributes: true, //Configure it to listen to attribute changes
      });
    }, 100);
  }

  public get data(): MessengerData {
    const content = this._messengerElement?.getAttribute("aria-label");

    const defaultData: MessengerData = {
      settings: {
        cursorAnimation: {
          enabled: false,
          color: "#ffffff",
          cursorType: "block",
          trailLength: 8,
          updateRate: 500,
        },
      },
      css: "",
    };

    if (!content) {
      return defaultData;
    }

    const parsedData = JSON.parse(content);

    if (!parsedData) {
      return defaultData;
    }

    return parsedData;
  }
}
