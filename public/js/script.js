function redirect() {
  window.location = "user.html";
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry);
    if (entry.isIntersecting) {
      entry.target.classList.add("writtenanime");
    } else {
      entry.target.classList.remove("writtenanime");
    }
  });
});

const anime = document.querySelectorAll(".anime");
const heading = document.querySelectorAll(".heading3");
anime.forEach((el) => observer.observe(el));
heading.forEach((bl) => observer.observe(bl));
