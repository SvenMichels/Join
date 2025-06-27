window.addEventListener("DOMContentLoaded", () => {
  const bignav-logo = document.querySelector(".bignav-logo");

  if (!bignav-logo) return;

  bignav-logo.classList.add("shrinkTonav-logo");

  bignav-logo.addEventListener("animationend", () => {
    bignav-logo.remove();
  });
});
