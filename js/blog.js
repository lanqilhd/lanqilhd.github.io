const posts = [
  {
    id: "svm-intro",
    title: "从一条线到高维空间：彻底搞懂支持向量机（SVM）",
    date: "2026-05-15",
    excerpt: "从直观的'最宽分界线'出发，深入硬间隔、软间隔、核技巧、对偶问题与SMO算法，一文讲透SVM的核心原理。",
    tags: ["机器学习", "SVM", "数学"],
    file: "posts/svm-intro.md"
  }
];

let currentPostId = null;

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year} 年 ${month} 月 ${day} 日`;
}

function renderBlogList() {
  const VISIBLE_POSTS = 5;
  const listEl = document.getElementById("blog-list");
  const expandWrapper = document.getElementById("blog-expand-wrapper");
  const expandBtn = document.getElementById("blog-expand-btn");
  if (!listEl) return;

  if (posts.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <div class="text">还没有文章，敬请期待……</div>
      </div>`;
    if (expandWrapper) expandWrapper.style.display = "none";
    return;
  }

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  listEl.innerHTML = sorted
    .map(
      (post, idx) => `
    <div class="blog-post-card ${idx >= VISIBLE_POSTS ? "blog-post-card-hidden" : ""}" data-post-id="${post.id}" data-post-index="${idx}">
      <div class="blog-post-info">
        <div class="blog-post-title">${post.title}</div>
        <div class="blog-post-excerpt">${post.excerpt}</div>
        <div class="blog-post-meta">
          <span class="blog-post-date">${formatDate(post.date)}</span>
          <span class="blog-post-tags">
            ${post.tags.map((t) => `<span class="blog-post-tag">${t}</span>`).join("")}
          </span>
        </div>
      </div>
      <span class="blog-post-arrow">→</span>
    </div>`
    )
    .join("");

  listEl.querySelectorAll(".blog-post-card").forEach((card) => {
    card.addEventListener("click", () => {
      const postId = card.dataset.postId;
      window.location.hash = "#/post/" + postId;
    });
  });

  if (expandWrapper && expandBtn && sorted.length > VISIBLE_POSTS) {
    expandWrapper.style.display = "flex";
    expandBtn.textContent = `更多文章 ↓ (共 ${sorted.length} 篇)`;
    const newBtn = expandBtn.cloneNode(true);
    expandBtn.parentNode.replaceChild(newBtn, expandBtn);
    newBtn.addEventListener("click", () => {
      const hidden = listEl.querySelectorAll(".blog-post-card-hidden");
      if (hidden.length > 0) {
        hidden.forEach((c) => c.classList.remove("blog-post-card-hidden"));
        newBtn.textContent = "收起 ↑";
      } else {
        sorted.forEach((_, idx) => {
          const card = listEl.querySelector(`[data-post-index="${idx}"]`);
          if (card && idx >= VISIBLE_POSTS) {
            card.classList.add("blog-post-card-hidden");
          }
        });
        newBtn.textContent = `更多文章 ↓ (共 ${sorted.length} 篇)`;
        document.getElementById("blog").scrollIntoView({ behavior: "smooth" });
      }
    });
  }
}

async function loadPostFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/^#\/post\/(.+)/);
  if (!match) {
    closePostPage();
    return;
  }

  const postId = match[1];
  const post = posts.find((p) => p.id === postId);
  if (!post) {
    closePostPage();
    return;
  }

  currentPostId = postId;

  document.querySelectorAll("section, .hero").forEach((el) => (el.style.display = "none"));
  document.querySelector(".footer").style.display = "none";
  const postPage = document.getElementById("post-page");
  postPage.classList.add("active");

  document.getElementById("post-page-content").innerHTML = `
    <div class="blog-article-header">
      <h1 class="blog-article-title">${post.title}</h1>
      <div class="blog-article-meta">
        <span>${formatDate(post.date)}</span>
        <span>${post.tags.map((t) => `<span class="blog-post-tag">${t}</span>`).join("")}</span>
      </div>
    </div>
    <div class="blog-article-content" id="blog-article-content">加载中……</div>
    <div class="giscus-wrapper">
      <h3 class="giscus-title">评论</h3>
      <div class="giscus" id="giscus-comments"></div>
    </div>
  `;

  try {
    const response = await fetch(post.file);
    if (!response.ok) throw new Error("文章加载失败");
    const markdown = await response.text();
    const contentEl = document.getElementById("blog-article-content");
    contentEl.innerHTML = marked.parse(markdown);

    if (typeof renderMathInElement !== "undefined") {
      renderMathInElement(contentEl, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false }
        ]
      });
    }

    generateTOC(contentEl);
    loadGiscus(postId);
  } catch (err) {
    document.getElementById("blog-article-content").innerHTML = `
      <div class="empty-state">
        <div class="icon">😞</div>
        <div class="text">文章加载失败，请稍后再试</div>
      </div>`;
  }

  window.scrollTo({ top: 0 });
}

function generateTOC(contentEl) {
  const tocEl = document.getElementById("post-toc");
  if (!tocEl) return;
  const headings = contentEl.querySelectorAll("h2, h3");
  if (headings.length === 0) return;

  headings.forEach((h, i) => {
    const id = "heading-" + i;
    h.id = id;
    const a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = h.textContent;
    a.className = h.tagName === "H3" ? "toc-h3" : "";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      h.scrollIntoView({ behavior: "smooth" });
      tocEl.querySelectorAll("a").forEach((l) => l.classList.remove("active"));
      a.classList.add("active");
    });
    tocEl.appendChild(a);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((e) => e.isIntersecting)
        .forEach((e) => {
          tocEl.querySelectorAll("a").forEach((l) => l.classList.remove("active"));
          const link = tocEl.querySelector(`a[href="#${e.target.id}"]`);
          if (link) link.classList.add("active");
        });
    },
    { rootMargin: "-80px 0px -60% 0px" }
  );
  headings.forEach((h) => observer.observe(h));
}

function closePostPage() {
  currentPostId = null;
  document.querySelectorAll("section, .hero").forEach((el) => (el.style.display = ""));
  document.querySelector(".footer").style.display = "";
  const postPage = document.getElementById("post-page");
  postPage.classList.remove("active");
  document.getElementById("post-page-content").innerHTML = "";
  document.getElementById("post-toc").innerHTML = "";
}

function loadGiscus(postId) {
  const container = document.getElementById("giscus-comments");
  if (!container) return;
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute("data-repo", "lanqilhd/lanqilhd.github.io");
  script.setAttribute("data-repo-id", "R_kgDOSdUJcA");
  script.setAttribute("data-category", "General");
  script.setAttribute("data-category-id", "DIC_kwDOSdUJcM4C9CgR");
  script.setAttribute("data-mapping", "specific");
  script.setAttribute("data-term", postId);
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "preferred_color_scheme");
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;
  container.appendChild(script);
}
