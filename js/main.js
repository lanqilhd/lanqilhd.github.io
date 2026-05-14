document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const backToTop = document.getElementById("backToTop");
  const navLinks = document.querySelectorAll(".nav-links a");
  const fadeElements = document.querySelectorAll(".fade-in");

  renderBlogList();

  function updateNavHighlight() {
    const scrollY = window.scrollY + 100;
    const sections = document.querySelectorAll("section[id]");

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    if (window.scrollY > 400) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }

    updateNavHighlight();
  }

  function handleFadeIn() {
    fadeElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      if (rect.top < windowHeight * 0.85) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", () => {
    handleScroll();
    handleFadeIn();
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  handleScroll();
  handleFadeIn();
});
