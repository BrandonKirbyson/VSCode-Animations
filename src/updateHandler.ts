console.log("UpdateHandler: Enabled");

/**
 * This is responsible for updating the css file when it changes
 */
(() => {
  const styleID = "VSCode-Animations-custom-css";

  const interval = setInterval(() => {
    const statusBarItem = document.getElementById(
      "BrandonKirbyson.vscode-animations"
    );

    if (!statusBarItem) return;

    clearInterval(interval); //Clear the interval

    createCustomCSS("");

    const observer = new MutationObserver((mutations: any) => {
      mutations.forEach((mutation: any) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-label"
        ) {
          const newCSS = mutation.target.getAttribute("aria-label");
          if (newCSS) {
            updateCustomCSS(newCSS);
          }
        }
      });
    });
    observer.observe(statusBarItem, {
      attributes: true, //Configure it to listen to attribute changes
    });
  }, 10);

  addAnimationUtil();

  /**
   * Creates the custom css element and inserts it into the document
   */
  function createCustomCSS(css: string) {
    const styleElement = document.createElement("style");
    styleElement.id = styleID;

    styleElement.textContent = css;

    document.body.insertAdjacentElement("afterbegin", styleElement);
  }

  /**
   * Updates the custom css element with the provided new css
   * @param css The css to update the custom css with
   */
  function updateCustomCSS(css: string) {
    const styleElement = document.querySelector(`#${styleID}`);

    //If the style element does not exist, create it
    if (!styleElement) {
      createCustomCSS(css);
      return;
    }

    if (styleElement.textContent === css) return; //If the css is the same, return

    styleElement.textContent = css;
  }

  /**
   * Adds util js functions to the page to help with animations
   */
  function addAnimationUtil() {
    //Add a mutation observer to the tabs-container to check for when a tab is added or removed
    const tabsObserver = new MutationObserver((mutations) => {
      const mutationData: {
        added: null | Node;
        removed: null | Node;
        updated: Node[];
      } = {
        added: null,
        removed: null,
        updated: [],
      };
      mutations.forEach((mutation) => {
        //Check that the target is only .tabs-container or a direct child of it
        if (
          (mutation.target as HTMLElement).className !== "tabs-container" &&
          mutation.target.parentElement?.className !== "tabs-container"
        )
          return;

        if (mutation.type === "childList") {
          if (mutation.addedNodes.length > 0) {
            mutationData.added = mutation.addedNodes[0]; //If a tab was added
          }

          if (mutation.removedNodes.length > 0) {
            mutationData.removed = mutation.removedNodes[0]; //If a tab was removed
          }

          // Get the first tab that just had its attributes changed
        } else if (mutation.type === "attributes") {
          if (mutation.attributeName !== "title") return;

          //Check if the title actually changed
          if (
            mutation.oldValue ===
            (mutation.target as HTMLElement).getAttribute("title")
          )
            return;

          mutationData.updated.push(mutation.target);
        }
      });

      if (
        mutationData.updated.length === 0 &&
        !mutationData.added &&
        !mutationData.removed
      )
        return; //If nothing changed, return

      const tabs = document.querySelectorAll(".tabs-container > .tab");

      //Remove all the classes
      tabs.forEach((tab) => {
        tab.classList.remove("newTab");
        tab.classList.remove("moveLeft");
        tab.classList.remove("moveRight");
        void (tab as HTMLElement).offsetWidth; //This line is very important, it forces the browser to reflow the element
      });

      if (mutationData.added) {
        (mutationData.updated[0] as HTMLElement).classList.add("newTab");
        for (let i = 1; i < mutationData.updated.length; i++) {
          (mutationData.updated[i] as HTMLElement).classList.add("moveRight");
        }
      } else if (mutationData.removed) {
        for (let i = 0; i < mutationData.updated.length; i++) {
          (mutationData.updated[i] as HTMLElement).classList.add("moveLeft");
        }
      }
    });

    const tabsObserverSettings = {
      childList: true, //Listen to tabs being added or removed
      attributes: true, //Listen to changes on the tabs
      attributeOldValue: true, //Get changes on the tabs
      attributeFilter: ["title"], //Only listen to changes on the title attribute
      subtree: true, //Listen to the tabs-container children as well
    };

    const splitViewObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            const tabList = (node as HTMLElement)
              .querySelector(".tabs-container")
              ?.getRootNode() as Node; //Get the tablist as a node
            tabsObserver.observe(tabList, tabsObserverSettings);
          });
        }
      });
    });
    waitForElement(".split-view-container", (splitViewContainers) => {
      waitForElement(".tabs-container", (tabsContainers) => {
        tabsContainers.forEach((tabsContainer) => {
          console.log("Observing tabs container");
          //Add the observer to the tabs-container element to listen for changes
          tabsObserver.observe(tabsContainer, tabsObserverSettings);
        });
      });

      splitViewContainers.forEach((splitViewContainer) => {
        splitViewObserver.observe(splitViewContainer, {
          childList: true,
        });
      });
    });

    // const editorLinesObserver = new MutationObserver((mutations) => {
    //   console.log("Mutations", mutations);
    //   // document.querySelector(".view-lines")?.childNodes.forEach((node) => {
    //   // (node as HTMLElement).classList.remove("newLine");
    //   // });
    //   mutations.forEach((mutation) => {
    //     if (mutation.type === "childList") {
    //       mutation.addedNodes.forEach((node) => {
    //         if ((node as HTMLElement).classList.contains("newLine")) {
    //           (node as HTMLElement).classList.remove("newLine");
    //           return;
    //         }
    //         (node as HTMLElement).classList.add("newLine");
    //         // setTimeout(() => {
    //         //   if (!node) return;
    //         //   (node as HTMLElement).classList.remove("newLine");
    //         // }, 1000);
    //       });
    //     }
    //   });
    // });

    // waitForElement(".view-lines", (editorLines) => {
    //   editorLinesObserver.observe(editorLines, {
    //     childList: true,
    //   });
    // });

    /**
     * Waits for an element to be added to the document and then runs the provided function
     * @param selector The selector to wait for
     * @param fn The function to run when the element is added
     */
    function waitForElement(
      selector: string,
      fn: (element: NodeListOf<Element>) => void
    ) {
      const interval = setInterval(() => {
        const element = document.querySelectorAll(selector);
        if (element.length > 0) {
          clearInterval(interval);
          fn(element);
        }
      }, 10);
    }
  }
})();
