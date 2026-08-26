const posts = Array.isArray(window.BLOG_POSTS)
  ? [...window.BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
  : [];

const escapeHtml = (value = '') => String(value).replace(/[&<>"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
})[character]);
const articleUrl = (post) => `article.html?slug=${encodeURIComponent(post.slug)}`;

function renderArchive() {
  const archive = document.querySelector('#blog-archive');
  if (!archive) return;

  const search = document.querySelector('#article-search');
  const filters = document.querySelector('#topic-filters');
  const featured = document.querySelector('#featured-post');
  const list = document.querySelector('#archive-list');
  const count = document.querySelector('#archive-count');
  const empty = document.querySelector('#empty-state');
  const topics = ['All', ...new Set(posts.map((post) => post.topic))];
  let activeTopic = 'All';

  filters.innerHTML = topics.map((topic) => `<button type="button" data-topic="${escapeHtml(topic)}" aria-pressed="${topic === 'All'}">${escapeHtml(topic)}</button>`).join('');

  function update() {
    const query = search.value.trim().toLowerCase();
    const visible = posts.filter((post) => {
      const topicMatch = activeTopic === 'All' || post.topic === activeTopic;
      const text = `${post.title} ${post.excerpt} ${post.topic} ${(post.tags || []).join(' ')}`.toLowerCase();
      return topicMatch && (!query || text.includes(query));
    });

    count.textContent = `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'} · frontend-owned`;
    empty.hidden = visible.length > 0;
    featured.hidden = visible.length === 0;
    list.hidden = visible.length === 0;
    if (!visible.length) return;

    const lead = visible[0];
    const visual = lead.image ? `<img src="${escapeHtml(lead.image)}" alt="" loading="eager" decoding="async">` : '';
    featured.innerHTML = `<a class="featured-card" href="${articleUrl(lead)}"><div class="featured-visual">${visual}</div><div class="featured-copy"><p class="post-kicker">${escapeHtml(lead.topic)} · ${escapeHtml(lead.dateLabel)}</p><h2>${escapeHtml(lead.title)}</h2><p>${escapeHtml(lead.excerpt)}</p><div class="post-foot"><span>${lead.readMinutes} min read</span><b>Read note ↗</b></div></div></a>`;
    list.innerHTML = visible.slice(1).map((post, index) => `<a class="archive-row" href="${articleUrl(post)}"><span class="row-number">${String(index + 2).padStart(2, '0')}</span><div><p class="row-meta">${escapeHtml(post.topic)} · ${escapeHtml(post.dateLabel)}</p><h2>${escapeHtml(post.title)}</h2></div><p class="row-excerpt">${escapeHtml(post.excerpt)}</p><i aria-hidden="true">↗</i></a>`).join('');
  }

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-topic]');
    if (!button) return;
    activeTopic = button.dataset.topic;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    update();
  });
  search.addEventListener('input', update);
  addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== search) {
      event.preventDefault();
      search.focus();
    }
  });
  update();
}

function sanitizeArticleHtml(source) {
  const parsed = new DOMParser().parseFromString(`<main>${source}</main>`, 'text/html');
  const root = parsed.querySelector('main');
  const allowed = new Set(['P', 'H2', 'H3', 'H4', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE', 'CODE', 'STRONG', 'B', 'EM', 'I', 'A', 'FIGURE', 'FIGCAPTION', 'IMG', 'BR', 'HR']);

  [...root.querySelectorAll('*')].reverse().forEach((element) => {
    if (!allowed.has(element.tagName)) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT'].includes(element.tagName)) element.remove();
      else element.replaceWith(...element.childNodes);
      return;
    }

    const href = element.tagName === 'A' ? element.getAttribute('href') || '' : '';
    const src = element.tagName === 'IMG' ? element.getAttribute('src') || '' : '';
    const alt = element.tagName === 'IMG' ? element.getAttribute('alt') || 'Article illustration' : '';
    const width = element.tagName === 'IMG' ? Number(element.getAttribute('width') || 2) : 2;
    [...element.attributes].forEach((attribute) => element.removeAttribute(attribute.name));

    if (element.tagName === 'A') {
      if (/^(https?:|mailto:)/i.test(href)) {
        element.setAttribute('href', href);
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else element.replaceWith(...element.childNodes);
    }
    if (element.tagName === 'IMG') {
      if (!/^https:/i.test(src) || src.includes('medium.com/_/stat') || width <= 1) return element.remove();
      element.setAttribute('src', src);
      element.setAttribute('alt', alt);
      element.setAttribute('loading', 'lazy');
      element.setAttribute('decoding', 'async');
    }
  });
  return root.innerHTML;
}

const emojiPattern = /\p{Extended_Pictographic}|\p{Emoji_Modifier}|[\u200d\ufe0e\ufe0f\u2640\u2642\u20e3]/gu;

function cleanArticleText(value) {
  return String(value || '')
    .replace(emojiPattern, '')
    .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, ' ')
    .replace(/coolest\s+part/gi, 'core design problem')
    .replace(/pure distributed magic\.?/gi, 'Cross-instance coordination without shared process memory.')
    .replace(/enters like a superhero/gi, 'provides the shared coordination layer')
    .replace(/the scalable magic/gi, 'cross-instance delivery')
    .replace(/everything just works/gi, 'all instances observe the same event stream')
    .replace(/[ \t]{2,}/g, ' ');
}

function headingSlug(value, index) {
  const readable = cleanArticleText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 54);
  return `section-${String(index + 1).padStart(2, '0')}-${readable || 'note'}`;
}

function prepareArticleContent(container, post) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    if (node.parentElement?.closest('pre, code')) return;
    node.nodeValue = cleanArticleText(node.nodeValue);
  });

  container.querySelectorAll('p, li, h2, h3, h4, blockquote').forEach((element) => {
    if (!element.textContent.trim() && !element.querySelector('img')) element.remove();
  });

  const firstHeading = container.querySelector('h2, h3');
  if (firstHeading) {
    const headingText = cleanArticleText(firstHeading.textContent).toLowerCase();
    const titleText = cleanArticleText(post.title).toLowerCase();
    const sharedLead = titleText.split(/[—:-]/)[0].trim();
    if (headingText.includes(sharedLead) || titleText.includes(headingText)) firstHeading.remove();
  }

  container.querySelectorAll('p').forEach((paragraph) => {
    const text = paragraph.textContent.toLowerCase();
    if (text.includes('live demo:') || text.includes('source code:')) paragraph.classList.add('article-reference');
    if (paragraph.querySelectorAll('br').length >= 2) paragraph.classList.add('article-sequence');
  });

  const headings = [...container.querySelectorAll('h2, h3')];
  const toc = document.querySelector('#article-toc');
  headings.forEach((heading, index) => {
    heading.id = headingSlug(heading.textContent, index);
    heading.dataset.section = String(index + 1).padStart(2, '0');
  });

  if (headings.length) {
    toc.innerHTML = headings.map((heading) => `<a href="#${heading.id}" data-target="${heading.id}"><span>${heading.dataset.section}</span>${escapeHtml(heading.textContent.trim())}</a>`).join('');
  } else {
    document.querySelector('.article-toc').hidden = true;
  }

  container.querySelectorAll('pre').forEach((pre, index) => {
    const wrapper = document.createElement('section');
    wrapper.className = 'article-code';
    const toolbar = document.createElement('div');
    toolbar.className = 'article-code__bar';
    toolbar.innerHTML = `<span>CODE / ${String(index + 1).padStart(2, '0')}</span><button type="button">Copy</button>`;
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.append(toolbar, pre);
    toolbar.querySelector('button').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      try {
        await navigator.clipboard.writeText(pre.innerText);
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Unavailable';
      }
    });
  });

  container.querySelectorAll('figure').forEach((figure, index) => {
    figure.dataset.figure = String(index + 1).padStart(2, '0');
    const image = figure.querySelector('img');
    if (image && (!image.alt || image.alt === 'Article illustration')) {
      image.alt = `Technical figure for ${post.title}`;
    }
  });

  if ('IntersectionObserver' in window && headings.length) {
    const links = [...toc.querySelectorAll('a')];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      links.forEach((link) => link.toggleAttribute('aria-current', link.dataset.target === visible.target.id));
    }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
    headings.forEach((heading) => observer.observe(heading));
  }
}

function renderArticle() {
  const article = document.querySelector('#article-page');
  if (!article) return;
  const slug = new URLSearchParams(location.search).get('slug');
  const post = posts.find((item) => item.slug === slug);
  if (!post) {
    article.hidden = true;
    document.querySelector('#article-not-found').hidden = false;
    document.title = 'Note not found — Hansraj Deghun';
    return;
  }

  const header = document.querySelector('#article-header');
  const content = document.querySelector('#article-content');
  const end = document.querySelector('#article-end');
  const index = posts.indexOf(post);
  const next = posts[index + 1] || posts[0];
  const canonical = `https://hansraj.me/article.html?slug=${encodeURIComponent(post.slug)}`;

  document.title = `${post.title} — Hansraj Deghun`;
  document.querySelector('meta[name="description"]').content = post.excerpt;
  document.querySelector('#canonical-url').href = canonical;
  document.querySelector('#og-title').content = post.title;
  document.querySelector('#og-description').content = post.excerpt;
  document.querySelector('#og-url').content = canonical;
  header.innerHTML = `<p class="prompt"><b>guest@portfolio</b><span>:</span><em>~/writing/${escapeHtml(post.slug)}</em><span>$</span> read</p><p class="post-kicker">${escapeHtml(post.topic)}</p><h1>${escapeHtml(post.title)}</h1><p class="article-deck">${escapeHtml(post.excerpt)}</p><div class="article-meta"><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.dateLabel)}</time><span>${post.readMinutes} min read</span><span class="topic">Hansraj Deghun</span></div><div class="article-tools"><a href="blogs.html">All notes ↩</a><a href="${escapeHtml(post.originalUrl)}" target="_blank" rel="noopener noreferrer">Original on Medium ↗</a><button type="button" id="copy-link">Copy link</button></div>`;
  content.innerHTML = sanitizeArticleHtml(post.content);
  prepareArticleContent(content, post);
  end.innerHTML = `<p>EOF · ${escapeHtml(post.dateLabel)}</p><a class="next-note" href="${articleUrl(next)}"><div><span>Read next</span><strong>${escapeHtml(next.title)}</strong></div><i aria-hidden="true">→</i></a>`;

  document.querySelector('#copy-link').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText(location.href);
      event.currentTarget.textContent = 'Copied ✓';
    } catch {
      event.currentTarget.textContent = 'Copy unavailable';
    }
  });
  const progress = document.querySelector('#reading-progress');
  const updateProgress = () => {
    const maximum = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${maximum > 0 ? Math.min(100, scrollY / maximum * 100) : 0}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

document.querySelector('#year').textContent = new Date().getFullYear();
renderArchive();
renderArticle();
