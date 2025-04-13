// enhancements.js
document.addEventListener("DOMContentLoaded", function () {
    var backToTop = document.getElementById("back-to-top");
  
    // Show or hide the button based on scroll position
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        backToTop.style.display = "flex";
      } else {
        backToTop.style.display = "none";
      }
    });
  
    // Smooth scroll back to top on click
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  