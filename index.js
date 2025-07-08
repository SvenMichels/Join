window.addEventListener("DOMContentLoaded", () => {
  const bigLogo = document.querySelector(".bigLogo");

  if (!bigLogo) return;

  bigLogo.classList.add("shrinkToLogo");

  bigLogo.addEventListener("animationend", () => {
    bigLogo.remove();
  });
});
 
console.log("test");