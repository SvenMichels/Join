window.addEventListener("DOMContentLoaded", () => {
  const bigLogo = document.querySelector(".bigLogo");

  if (!bigLogo) return;

  bigLogo.classList.add("shrinkToLogo");

  bigLogo.addEventListener("animationend", () => {
    bigLogo.remove();
  });
});
 
console.log("Big logo animation script loaded.");

  function isMobileDevice() {
    return window.innerWidth <= 820;
  }

  function isLandscapeMode() {
    return window.matchMedia("(orientation: landscape)").matches;
  }

  function toggleRotateWarning() {
    const warning = document.getElementById("rotateWarning");
    const shouldShow = isMobileDevice() && isLandscapeMode();
    warning.style.display = shouldShow ? "flex" : "none";
  }

  window.addEventListener("orientationchange", toggleRotateWarning);
  window.addEventListener("resize", toggleRotateWarning);
  document.addEventListener("DOMContentLoaded", toggleRotateWarning);

