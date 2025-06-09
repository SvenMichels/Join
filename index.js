window.addEventListener("DOMContentLoaded", () => {
  const bigLogo = document.getElementById("bigLogo");
  const smallLogo = document.getElementById("logo");

  hideElement(smallLogo);
  animateBigLogoShrink(bigLogo, () => {
    removeElement(bigLogo);
    showElement(smallLogo);
  });
});

function hideElement(element) {
  element.hidden = true;
}

function showElement(element) {
  element.hidden = false;
}

function removeElement(element) {
  element.remove();
}

function animateBigLogoShrink(element, onComplete) {
  setTimeout(() => {
    element.classList.add("shrinkToLogo");
  }, 1500);

  element.addEventListener("transitionend", function handleTransitionEnd() {
    element.removeEventListener("transitionend", handleTransitionEnd);
    onComplete();
  });
}

export function changeToSignup() {
  window.location.href = "../signup/signup.html";
}
