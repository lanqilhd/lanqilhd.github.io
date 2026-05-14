document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const backToTop = document.getElementById("backToTop");
  const navLinks = document.querySelectorAll(".nav-links a");
  const fadeElements = document.querySelectorAll(".fade-in");
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-links");

  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
    navToggle.classList.toggle("open");
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("open");
    });
  });

  renderBlogList();
  updateHeroStats();
  initExpandToggle();
  initSearch();
  handleHashChange();

  window.addEventListener("hashchange", handleHashChange);

  function handleHashChange() {
    const hash = window.location.hash;
    if (hash.startsWith("#/post/")) {
      if (typeof loadPostFromHash === "function") loadPostFromHash();
    } else {
      if (typeof closePostPage === "function") closePostPage();
    }
  }

  function initSearch() {
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    if (!searchInput || !searchResults) return;

    let searchTimeout;

    searchInput.addEventListener("input", () => {
      clearTimeout(searchTimeout);
      const query = searchInput.value.trim().toLowerCase();

      if (query.length < 1) {
        searchResults.style.display = "none";
        return;
      }

      searchTimeout = setTimeout(() => {
        const results = [];

        if (typeof posts !== "undefined") {
          posts.forEach((p) => {
            const haystack = (p.title + " " + p.excerpt + " " + p.tags.join(" ")).toLowerCase();
            if (haystack.includes(query)) {
              results.push({ type: "文章", title: p.title, id: p.id, link: "#/post/" + p.id });
            }
          });
        }

        const projectCards = document.querySelectorAll("#projects-grid .project-card");
        projectCards.forEach((card) => {
          const text = card.textContent.toLowerCase();
          if (text.includes(query)) {
            const title = card.querySelector(".project-name").textContent;
            results.push({ type: "项目", title: title, link: "#projects" });
          }
        });

        if (results.length === 0) {
          searchResults.innerHTML = '<div class="search-result-item"><span class="search-result-title">无匹配结果</span></div>';
        } else {
          searchResults.innerHTML = results
            .map(
              (r) => `
            <a class="search-result-item" href="${r.link}">
              <div class="search-result-title">${r.title}</div>
              <div class="search-result-type">${r.type}</div>
            </a>`
            )
            .join("");
        }
        searchResults.style.display = "block";
      }, 200);
    });

    document.addEventListener("click", (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = "none";
      }
    });

    searchResults.addEventListener("click", () => {
      searchInput.value = "";
      searchResults.style.display = "none";
    });
  }

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

  function initExpandToggle() {
    const VISIBLE_PROJECTS = 3;

    const grid = document.getElementById("projects-grid");
    const projectWrapper = document.getElementById("projects-expand-wrapper");
    const projectBtn = document.getElementById("projects-expand-btn");

    if (grid && projectWrapper && projectBtn) {
      const cards = grid.querySelectorAll(".project-card");
      if (cards.length > VISIBLE_PROJECTS) {
        projectWrapper.style.display = "flex";
        for (let i = VISIBLE_PROJECTS; i < cards.length; i++) {
          cards[i].classList.add("project-card-hidden");
        }
        projectBtn.addEventListener("click", () => {
          const hidden = grid.querySelectorAll(".project-card-hidden");
          if (hidden.length > 0) {
            hidden.forEach((c) => c.classList.remove("project-card-hidden"));
            projectBtn.textContent = "收起 ↑";
          } else {
            for (let i = VISIBLE_PROJECTS; i < cards.length; i++) {
              cards[i].classList.add("project-card-hidden");
            }
            projectBtn.textContent = "更多项目 ↓";
            document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    }
  }
});
