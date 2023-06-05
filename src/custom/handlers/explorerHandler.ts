// monaco-icon-label

// .explorer-folders-view .monaco-list-rows

import { waitForElement } from "./util";

/**
 * The function that handles all the tab animations
 */
export function initExplorerHandler() {
  //Add a mutation observer to the tabs-container to check for when a tab is added or removed
  const explorerObserver = new MutationObserver((mutations) => {
    const mutationData: {
      added: Node[];
      removed: Node[];
      updated: Node[];
    } = {
      added: [],
      removed: [],
      updated: [],
    };
    mutations.forEach((mutation) => {
      if (
        !(mutation.target as HTMLElement).className.includes(
          "monaco-list-rows"
        ) &&
        !(mutation.target as HTMLElement).className.includes(
          "monaco-icon-label"
        )
      )
        return;

      if (mutation.type === "childList") {
        if (mutation.addedNodes.length > 0) {
          mutationData.added.push(mutation.addedNodes[0]); //If a tab was added
        }

        if (mutation.removedNodes.length > 0) {
          mutationData.removed.push(mutation.removedNodes[0]); //If a tab was removed
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

        mutationData.updated.push(
          mutation.target.parentNode?.parentNode?.parentNode as Node
        );
      }
    });

    if (
      mutationData.updated.length === 0 &&
      mutationData.added.length === 0 &&
      mutationData.removed.length === 0
    )
      return; //If nothing changed, return

    const files = document.querySelectorAll(
      ".explorer-folders-view .monaco-list-rows > .monaco-list-row"
    );

    //Remove all the classes
    files.forEach((file) => {
      file.classList.remove("newFile");
      file.classList.remove("moveUp");
      file.classList.remove("moveDown");
      void (file as HTMLElement).offsetWidth; //This line is very important, it forces the browser to reflow the element
    });

    console.log(mutationData);

    const addClassToNewFile = (element: Node) => {
      (element as HTMLElement).classList.add("newFile");
      const id = (element as HTMLElement).id;
      let index = parseInt(id.substring(id.lastIndexOf("_") + 1, id.length));
      let firstId: string;
      if (mutationData.updated.length > 0) {
        firstId = (mutationData.updated[0] as HTMLElement).id;
      } else {
        firstId = (mutationData.added[0] as HTMLElement).id;
      }
      index -= parseInt(
        firstId.substring(firstId.lastIndexOf("_") + 1, firstId.length)
      );

      (element as HTMLElement).style.setProperty("--local-offset", `${index}`);
    };

    //! use aria-level to get the level of the file

    // files.forEach((file) => {
    //   console.log(file.getAttribute("aria-level"));
    // });

    // if (mutationData.added.length > 0 || mutationData.updated.length > 0) {
    //   let firstElement!: Node;
    //   if (mutationData.added.length > mutationData.updated.length) {
    //     firstElement = mutationData.added[0];
    //   } else {
    //     firstElement = mutationData.updated[0];
    //   }
    //   const level =
    //     parseInt(
    //       (firstElement as HTMLElement).getAttribute("aria-level") || "0"
    //     ) + 1;
    //   let sibling = firstElement.nextSibling;
    //   for (let i = 0; i < files.length; i++) {
    //     if (
    //       sibling &&
    //       (sibling as HTMLElement).getAttribute("aria-level") === `${level}`
    //     ) {
    //       console.log(sibling);
    //       addClassToNewFile(sibling);
    //       sibling = sibling.nextSibling;
    //     } else {
    //       break;
    //     }
    //   }
    // }

    if (mutationData.added.length > 0 || mutationData.updated.length > 0) {
      if (mutationData.removed.length < mutationData.added.length) {
        if (mutationData.added.length > mutationData.updated.length) {
          for (let i = 0; i < mutationData.added.length; i++) {
            addClassToNewFile(mutationData.added[i]);
            // if (mutationData.updated.length > 0) {
            // if (!mutationData.updated[i]) continue;
            //   console.log(mutationData.updated[i]);
            // addClassToNewFile(mutationData.updated[i]);
            // }
          }
        } else {
          for (let i = 0; i < mutationData.updated.length; i++) {
            addClassToNewFile(mutationData.updated[i]);
          }
        }
        // for (let i = 0; i < mutationData.added.length; i++) {
        //   if (mutationData.updated.length > 0) {
        //     if (!mutationData.updated[i]) continue;
        //     //   console.log(mutationData.updated[i]);
        //     addClassToNewFile(mutationData.updated[i]);
        //   } else {
        //     //   console.log(mutationData.added[i]);
        //     //   (mutationData.added[i] as HTMLElement).classList.add("newFile");
        //     addClassToNewFile(mutationData.added[i]);
        //   }
        // }
      }
    }

    // if (mutationData.added) {
    //   (mutationData.updated[0] as HTMLElement).classList.add("newTab");
    //   for (let i = 1; i < mutationData.updated.length; i++) {
    //     (mutationData.updated[i] as HTMLElement).classList.add("moveRight");
    //   }
    // } else if (mutationData.removed) {
    //   for (let i = 0; i < mutationData.updated.length; i++) {
    //     (mutationData.updated[i] as HTMLElement).classList.add("moveLeft");
    //   }
    // }
  });

  const explorerObserverSettings = {
    childList: true, //Listen to tabs being added or removed
    attributes: true, //Listen to changes on the tabs
    attributeOldValue: true, //Get changes on the tabs
    attributeFilter: ["title"], //Only listen to changes on the title attribute
    subtree: true, //Listen to the tabs-container children as well
  };

  waitForElement(".explorer-folders-view .monaco-list-rows", (explorer) => {
    console.log("Adding observer");
    //Add the observer to the explorer list element to listen for changes
    explorerObserver.observe(explorer, explorerObserverSettings);
  });
}
