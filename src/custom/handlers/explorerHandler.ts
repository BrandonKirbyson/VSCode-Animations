import { waitForElement } from "./util";

/**
 * The function that handles all the explorer animations
 */
export function initExplorerHandler() {
  //Add a mutation observer to the explorer to check for file tree changes
  const explorerObserver = new MutationObserver((mutations) => {
    const mutationData: {
      opened: Node[];
      closed: Node[];
    } = {
      opened: [],
      closed: [],
    };

    mutations.forEach((mutation) => {
      if (
        !(mutation.target as HTMLElement).className.includes(
          "monaco-list-rows"
        ) &&
        !(mutation.target as HTMLElement).className.includes("monaco-list-row")
      )
        return;

      // console.log(mutation);

      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "aria-expanded" &&
        mutation.oldValue !== null &&
        mutation.oldValue !==
          (mutation.target as HTMLElement).getAttribute("aria-expanded")
      ) {
        if (
          (mutation.target as HTMLElement).getAttribute("aria-expanded") ===
          "true"
        ) {
          console.log("Actually updated: ", mutation);
          mutationData.opened.push(mutation.target);
        } else if (
          (mutation.target as HTMLElement).getAttribute("aria-expanded") ===
          "false"
        ) {
          mutationData.closed.push(mutation.target);
        }
      }
    });

    const files = document.querySelectorAll(
      ".explorer-folders-view .monaco-list-rows > .monaco-list-row"
    );

    //Remove all the classes
    files.forEach((file) => {
      file.classList.remove("newFile");
      void (file as HTMLElement).offsetWidth; //This line is very important, it forces the browser to reflow the element
    });

    console.log(mutationData);

    // if (
    //   mutations.find((mutation) => {
    //     if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
    //       return false;
    //     }
    //     console.log("Added for first time!");
    //     return true;
    //   })
    // ) {
    //   return;
    // }

    //Add the classes
    if (mutationData.opened.length > 0) {
      interface TreeItem {
        element: HTMLElement;
        level: number;
      }

      //Get the highest level opened folder
      let topFolder: TreeItem = {
        element: mutationData.opened[0] as HTMLElement,
        level: parseInt(
          (mutationData.opened[0] as HTMLElement).getAttribute("aria-level")!
        ),
      };
      mutationData.opened.forEach((element) => {
        const level = parseInt(
          (element as HTMLElement).getAttribute("aria-level")!
        );
        if (level < topFolder.level) {
          topFolder = {
            element: element as HTMLElement,
            level: level,
          };
        }
      });

      //! Use mix of aria-expanded and title updated to detect new files

      // console.log(topFolder);

      // debugger;

      let nextElement = topFolder.element.nextElementSibling;
      for (let i = 0; i < files.length; i++) {
        if (nextElement === null) break;
        // console.log("Next Element", nextElement?.getAttribute("aria-level"));
        if (
          parseInt(nextElement.getAttribute("aria-level") || "0") >
          topFolder.level
        ) {
          (nextElement as HTMLElement).classList.add("newFile");
          (nextElement as HTMLElement).style.setProperty(
            "--local-offset",
            `${i}`
          );
          nextElement = nextElement.nextElementSibling;
        }
        // else break;
      }
    }

    // const addClassToNewFile = (element: Node) => {
    //   (element as HTMLElement).classList.add("newFile");
    //   const id = (element as HTMLElement).id;
    //   let index = parseInt(id.substring(id.lastIndexOf("_") + 1, id.length));
    //   let firstId: string;
    //   if (mutationData.updated.length > 0) {
    //     firstId = (mutationData.updated[0] as HTMLElement).id;
    //   } else {
    //     firstId = (mutationData.added[0] as HTMLElement).id;
    //   }
    //   index -= parseInt(
    //     firstId.substring(firstId.lastIndexOf("_") + 1, firstId.length)
    //   );

    //   (element as HTMLElement).style.setProperty("--local-offset", `${index}`);
    // };
  });

  const explorerObserverSettings = {
    childList: true, //Listen to tabs being added or removed
    attributes: true, //Listen to changes on the tabs
    attributeOldValue: true, //Get changes on the tabs
    attributeFilter: ["aria-expanded"], //Only listen to changes on the title attribute
    subtree: true, //Listen to the tabs-container children as well
  };

  waitForElement(".explorer-folders-view .monaco-list-rows", (explorer) => {
    //Add the observer to the explorer list element to listen for changes
    explorerObserver.observe(explorer, explorerObserverSettings);
  });
}
