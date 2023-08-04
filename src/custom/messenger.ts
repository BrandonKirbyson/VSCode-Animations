export interface MessengerData {
  settings: {
    cursorAnimation: {
      enabled: boolean;
      color: string;
      cursorStyle: "block" | "line";
      trailLength: number;
    };
    focus: {
      enabled: boolean;
      wholeEditor: boolean;
      amount: number;
      duration: number;
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
          cursorStyle: "line",
          trailLength: 8,
        },
        focus: {
          enabled: false,
          wholeEditor: false,
          amount: 50,
          duration: 200,
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
