export function highlightActiveNavigationLinks(
  navigationSelectors = [".nav-buttons", ".taskFrameLink"]
) {
  const currentPagePath = window.location.pathname
    .split("/")
    .pop()
    .replace(/[#?].*$/, "");
    
  const combinedSelectors = navigationSelectors.join(",");
  const navigationElements = document.querySelectorAll(combinedSelectors);
  
  for (let elementIndex = 0; elementIndex < navigationElements.length; elementIndex++) {
    const navigationElement = navigationElements[elementIndex];
    
    const linkHref = navigationElement.tagName === "A"
      ? navigationElement.getAttribute("href")
      : navigationElement.closest("a")?.getAttribute("href");
      
    if (!linkHref) continue;
    
    const targetPagePath = linkHref
      .split("/")
      .pop()
      .replace(/[#?].*$/, "");
      
    if (targetPagePath === currentPagePath) {
      navigationElement.classList.add("active");
    }
  }
}
