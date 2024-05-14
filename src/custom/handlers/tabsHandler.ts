import { waitForElements } from "./util";

/**
 * The function that handles all the tab animations
 */
export function initTabsHandler() {
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
          if (
            !(mutation.removedNodes[0] as HTMLElement).classList.contains(
              "deletedTab"
            )
          ) {
            const tempTab = mutation.removedNodes[0] as HTMLElement;
            // const tempTab = document.createElement("div");
            // tempTab.textContent = "Deleted Tab";
            // tempTab.classList.forEach((className) => {
            //   console.log(className);
            //   tempTab.classList.remove(className);
            // });
            tempTab.classList.add("deletedTab");
            // mutation.target.appendChild(tempTab);
            // (mutation.previousSibling as HTMLElement).insertAdjacentElement(
            //   "afterend",
            //   tempTab
            // );

            // function setInlineStyles(element: HTMLElement) {
            //   const computedStyle = window.getComputedStyle(element);
            //   for (let i = 0; i < computedStyle.length; i++) {
            //     const property: string = computedStyle[i];
            //     element.style[property as any] =
            //       computedStyle.getPropertyValue(property);
            //   }
            // }

            // setInlineStyles(tempTab);
            // tempTab
            //   .querySelectorAll("*")
            //   .forEach((child) => setInlineStyles(child as HTMLElement));

            // tempTab.setAttribute("class", "removedTab");

            // tempTab
            //   .querySelectorAll("*")
            //   .forEach((child) => child.setAttribute("class", ""));

            // tempTab.addEventListener("animationend", () => {
            //   // mutation.target.removeChild(tempTab);
            //   tempTab.remove();
            //   tempTab.removeEventListener("animationend", () => {});
            // });
            mutationData.removed = tempTab; //If a tab was removed
          }
        }

        // if (mutation.attributeName !== "aria-label") return;

        // //Check if the title actually changed
        // if (
        //   mutation.oldValue ===
        //   (mutation.target as HTMLElement).getAttribute("aria-label")
        // )
        //   return;

        // mutationData.updated.push(mutation.target);

        // Get the first tab that just had its attributes changed
      } else if (mutation.type === "attributes") {
        if (mutation.attributeName !== "aria-label") return;

        //Check if the title actually changed
        if (
          mutation.oldValue ===
          (mutation.target as HTMLElement).getAttribute("aria-label")
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

    if (mutationData.added && mutationData.updated.length > 0) {
      (mutationData.updated[0] as HTMLElement).classList.add("newTab");
      for (let i = 1; i < mutationData.updated.length; i++) {
        (mutationData.updated[i] as HTMLElement).classList.add("moveRight");
      }
    } else if (mutationData.removed) {
      // console.log(mutationData.updated);
      // if (mutationData.updated.length > 0) {
      //   (mutationData.updated[0] as HTMLElement).insertAdjacentElement(
      //     "beforebegin",
      //     mutationData.removed as HTMLElement
      //   );
      // } else {
      //   mutations[0].target.appendChild(mutationData.removed);
      // }

      for (let i = 0; i < mutationData.updated.length; i++) {
        (mutationData.updated[i] as HTMLElement).classList.add("moveLeft");
      }
    }
  });

  const tabsObserverSettings = {
    childList: true, //Listen to tabs being added or removed
    attributes: true, //Listen to changes on the tabs
    attributeOldValue: true, //Get changes on the tabs
    attributeFilter: ["aria-label"], //Only listen to changes on the title attribute
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
  waitForElements(".split-view-container", (splitViewContainers) => {
    waitForElements(".tabs-container", (tabsContainers) => {
      tabsContainers.forEach((tabsContainer) => {
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
}
