const posts = [
  {
    id: "hello-world",
    title: "欢迎来到我的博客",
    date: "2025-05-10",
    excerpt: "这是我的第一篇博客文章，记录了这个个人主页的搭建过程与初衷。",
    tags: ["随笔", "建站"],
    file: "posts/hello-world.md"
  },
  {
    id: "learning-ml",
    title: "机器学习入门笔记",
    date: "2025-05-08",
    excerpt: "整理了一些机器学习基础概念和常用算法的入门笔记，方便日后复习查阅。",
    tags: ["机器学习", "笔记"],
    file: "posts/learning-ml.md"
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
  const listEl = document.getElementById("blog-list");
  if (!listEl) return;

  if (posts.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">📝</div>
        <div class="text">还没有文章，敬请期待……</div>
      </div>`;
    return;
  }

  listEl.innerHTML = posts
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (post) => `
    <div class="blog-post-card" data-post-id="${post.id}">
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
      openPost(postId);
    });
  });
}

async function openPost(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  currentPostId = postId;

  document.getElementById("blog-list-view").style.display = "none";
  const detailView = document.getElementById("blog-detail-view");
  detailView.classList.add("active");
  detailView.innerHTML = `
    <button class="blog-back" id="blog-back-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
      返回文章列表
    </button>
    <div class="blog-article-header">
      <h1 class="blog-article-title">${post.title}</h1>
      <div class="blog-article-meta">
        <span>${formatDate(post.date)}</span>
        <span>${post.tags.map((t) => `<span class="blog-post-tag">${t}</span>`).join("")}</span>
      </div>
    </div>
    <div class="blog-article-content" id="blog-article-content">加载中……</div>
  `;

  document.getElementById("blog-back-btn").addEventListener("click", closePost);

  try {
    const response = await fetch(post.file);
    if (!response.ok) throw new Error("文章加载失败");
    const markdown = await response.text();
    document.getElementById("blog-article-content").innerHTML = marked.parse(markdown);
  } catch (err) {
    document.getElementById("blog-article-content").innerHTML = `
      <div class="empty-state">
        <div class="icon">😞</div>
        <div class="text">文章加载失败，请稍后再试</div>
      </div>`;
  }

  document.getElementById("blog").scrollIntoView({ behavior: "smooth" });
}

function closePost() {
  currentPostId = null;
  document.getElementById("blog-list-view").style.display = "block";
  document.getElementById("blog-detail-view").classList.remove("active");
  document.getElementById("blog-detail-view").innerHTML = "";
}
