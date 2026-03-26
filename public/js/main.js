// Auto-dismiss flash messages
document.addEventListener("DOMContentLoaded", () => {
  const flashes = document.querySelectorAll(".flash");
  flashes.forEach((f) => {
    setTimeout(() => {
      f.style.transition = "opacity 0.5s, transform 0.5s";
      f.style.opacity = "0";
      f.style.transform = "translateY(-8px)";
      setTimeout(() => f.remove(), 500);
    }, 4000);
  });
});
