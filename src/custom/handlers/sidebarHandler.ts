import { waitForElement } from "./util";

/**
 * The function that handles all the sidebar animations
 * Ensures smooth animations work properly when both primary and secondary sidebars are open
 */
export function initSidebarHandler() {
  let primarySidebarState = false;
  let secondarySidebarState = false;
  let terminalPanelState = false;
  let extensionsPanelState = false;

  // Observer for primary sidebar (left side - explorer, source control, etc.)
  const observePrimarySidebar = () => {
    waitForElement('.part.sidebar.left', (primarySidebar) => {
      const primaryObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as HTMLElement;
            const currentlyVisible = !target.style.display || target.style.display !== 'none';
            
            if (currentlyVisible !== primarySidebarState) {
              primarySidebarState = currentlyVisible;
              updatePanelClasses();
            }
          }
        });
      });

      primaryObserver.observe(primarySidebar, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });
  };

  // Observer for secondary sidebar (right side - outline, etc.)
  const observeSecondarySidebar = () => {
    waitForElement('.part.sidebar.right', (secondarySidebar) => {
      const secondaryObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as HTMLElement;
            const currentlyVisible = !target.style.display || target.style.display !== 'none';
            
            if (currentlyVisible !== secondarySidebarState) {
              secondarySidebarState = currentlyVisible;
              updatePanelClasses();
            }
          }
        });
      });

      secondaryObserver.observe(secondarySidebar, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });
  };

  // Observer for terminal panel (bottom panel)
  const observeTerminalPanel = () => {
    waitForElement('.part.panel', (terminalPanel) => {
      const terminalObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as HTMLElement;
            const currentlyVisible = !target.style.display || target.style.display !== 'none';
            
            if (currentlyVisible !== terminalPanelState) {
              terminalPanelState = currentlyVisible;
              updatePanelClasses();
            }
          }
        });
      });

      terminalObserver.observe(terminalPanel, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });
  };

  // Observer for extensions panel (auxiliary bar)
  const observeExtensionsPanel = () => {
    waitForElement('.part.auxiliarybar', (extensionsPanel) => {
      const extensionsObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as HTMLElement;
            const currentlyVisible = !target.style.display || target.style.display !== 'none';
            
            if (currentlyVisible !== extensionsPanelState) {
              extensionsPanelState = currentlyVisible;
              updatePanelClasses();
            }
          }
        });
      });

      extensionsObserver.observe(extensionsPanel, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    });
  };

  // Update workbench classes based on all panel states
  const updatePanelClasses = () => {
    waitForElement('.monaco-workbench', (workbench) => {
      // Remove existing panel state classes
      workbench.classList.remove(
        'primary-sidebar-open',
        'secondary-sidebar-open',
        'both-sidebars-open',
        'no-sidebars-open',
        'terminal-panel-open',
        'extensions-panel-open',
        'all-panels-open'
      );

      // Add appropriate classes based on current state
      if (primarySidebarState && secondarySidebarState) {
        workbench.classList.add('both-sidebars-open');
      } else if (primarySidebarState) {
        workbench.classList.add('primary-sidebar-open');
      } else if (secondarySidebarState) {
        workbench.classList.add('secondary-sidebar-open');
      } else {
        workbench.classList.add('no-sidebars-open');
      }

      // Add panel-specific classes
      if (terminalPanelState) {
        workbench.classList.add('terminal-panel-open');
      }
      
      if (extensionsPanelState) {
        workbench.classList.add('extensions-panel-open');
      }

      // Add combined class if multiple panels are open
      const openPanelCount = [primarySidebarState, secondarySidebarState, terminalPanelState, extensionsPanelState].filter(Boolean).length;
      if (openPanelCount >= 2) {
        workbench.classList.add('all-panels-open');
      }
    });
  };

  // Enhanced animation support for smooth transitions
  const enhancePanelAnimations = () => {
    waitForElement('.monaco-workbench', (workbench) => {
      // Add CSS custom properties for enhanced control
      const style = document.createElement('style');
      style.textContent = `
        /* Enhanced sidebar and panel animation support */
        .monaco-workbench.both-sidebars-open .part.sidebar,
        .monaco-workbench.all-panels-open .part.sidebar,
        .monaco-workbench.all-panels-open .part.panel,
        .monaco-workbench.all-panels-open .part.auxiliarybar {
          transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1) !important;
        }
        
        .monaco-workbench.both-sidebars-open .split-view-view,
        .monaco-workbench.all-panels-open .split-view-view {
          transition-delay: 0ms !important;
        }
        
        /* Ensure animations work for all panels */
        .monaco-workbench .part.sidebar.left[style*="width"],
        .monaco-workbench .part.sidebar.right[style*="width"],
        .monaco-workbench .part.panel[style*="height"],
        .monaco-workbench .part.auxiliarybar[style*="width"] {
          transition-property: width, height, transform, opacity !important;
          transition-duration: var(--smooth-windows-duration, 300ms) !important;
          transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1) !important;
        }
        
        /* Enhanced support for activitybar and terminal */
        .monaco-workbench .part.activitybar[style*="width"],
        .monaco-workbench .terminal-outer-container[style*="height"],
        .monaco-workbench .integrated-terminal[style*="height"] {
          transition-property: width, height, transform, opacity !important;
          transition-duration: var(--smooth-windows-duration, 300ms) !important;
          transition-timing-function: cubic-bezier(0.4, 0.0, 0.2, 1) !important;
        }
        
        /* Smooth terminal toggle animations */
        .monaco-workbench.terminal-panel-open .part.panel {
          animation: panelSlideIn var(--smooth-windows-duration, 300ms) cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        /* Smooth extensions panel toggle animations */
        .monaco-workbench.extensions-panel-open .part.auxiliarybar {
          animation: sidebarSlideIn var(--smooth-windows-duration, 300ms) cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        @keyframes panelSlideIn {
          from {
            height: 0;
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            height: auto;
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes sidebarSlideIn {
          from {
            width: 0;
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            width: auto;
            opacity: 1;
            transform: translateX(0);
          }
        }
      `;
      document.head.appendChild(style);
    });
  };

  // Initialize all observers
  observePrimarySidebar();
  observeSecondarySidebar();
  observeTerminalPanel();
  observeExtensionsPanel();
  enhancePanelAnimations();
  
  // Initial state check
  setTimeout(() => {
    const primarySidebar = document.querySelector('.part.sidebar.left') as HTMLElement;
    const secondarySidebar = document.querySelector('.part.sidebar.right') as HTMLElement;
    const terminalPanel = document.querySelector('.part.panel') as HTMLElement;
    const extensionsPanel = document.querySelector('.part.auxiliarybar') as HTMLElement;
    
    if (primarySidebar) {
      primarySidebarState = !primarySidebar.style.display || primarySidebar.style.display !== 'none';
    }
    
    if (secondarySidebar) {
      secondarySidebarState = !secondarySidebar.style.display || secondarySidebar.style.display !== 'none';
    }
    
    if (terminalPanel) {
      terminalPanelState = !terminalPanel.style.display || terminalPanel.style.display !== 'none';
    }
    
    if (extensionsPanel) {
      extensionsPanelState = !extensionsPanel.style.display || extensionsPanel.style.display !== 'none';
    }
    
    updatePanelClasses();
  }, 100);
}