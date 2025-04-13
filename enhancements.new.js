document.addEventListener("DOMContentLoaded", function () {
    var backToTop = document.getElementById("back-to-top");
  
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        backToTop.style.display = "flex";
      } else {
        backToTop.style.display = "none";
      }
    });
  
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  