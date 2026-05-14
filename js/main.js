document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const backToTop = document.getElementById("backToTop");
  const navLinks = document.querySelectorAll(".nav-links a");
  const fadeElements = document.querySelectorAll(".fade-in");

  renderBlogList();
  updateHeroStats();

  function updateHeroStats() {
    const postsEl = document.getElementById("stat-posts");
    const updatedEl = document.getElementById("stat-updated");
    const reposEl = document.getElementById("stat-repos");

    if (postsEl && typeof posts !== "undefined") {
      postsEl.textContent = posts.length;
    }

    if (reposEl) {
      fetch("https://api.github.com/users/lanqilhd")
        .then((r) => r.json())
        .then((data) => {
          if (data.public_repos !== undefined) {
            reposEl.textContent = data.public_repos;
          }
        })
        .catch(() => {});
    }

    if (updatedEl && typeof posts !== "undefined" && posts.length > 0) {
      const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = new Date(sorted[0].date + "T00:00:00");
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.floor((today - latest) / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) updatedEl.textContent = "今天";
      else if (diffDays === 1) updatedEl.textContent = "昨天";
      else if (diffDays <= 7) updatedEl.textContent = diffDays + " 天前";
      else if (diffDays <= 30) updatedEl.textContent = Math.floor(diffDays / 7) + " 周前";
      else updatedEl.textContent = formatDateShort(sorted[0].date);
    }
  }

  function formatDateShort(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  }

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
