const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const boot = document.querySelector('#boot');
const skipBoot = document.querySelector('#skip-boot');

function closeBoot() {
  if (!boot || boot.classList.contains('is-hidden')) return;
  boot.classList.add('is-hidden');
  document.body.style.overflow = '';
  setTimeout(() => boot.remove(), 500);
}

if (boot && !reduceMotion) {
  document.body.style.overflow = 'hidden';
  skipBoot.addEventListener('click', closeBoot);
  setTimeout(closeBoot, 2800);
} else {
  boot?.remove();
}

const reveals = document.querySelectorAll('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((item) => observer.observe(item));
}

const commands = [
  { label: './home', detail: 'Introduction', target: '#home' },
  { label: './experience', detail: 'Career log', target: '#experience' },
  { label: './writing', detail: 'Engineering notes', target: '#writing' },
  { label: './skills', detail: 'Technical skills', target: '#skills' },
  { label: './systems', detail: 'Interactive case studies', target: '#systems' },
  { label: './contact', detail: 'Start a conversation', target: '#contact' },
  { label: 'open résumé', detail: 'Google Drive ↗', target: 'https://drive.google.com/file/d/1dh3HAQpWbVnPlSdPzVh4nB1KLcUPBLRP/view?usp=sharing', external: true }
];

const dialog = document.querySelector('#command-dialog');
const commandButton = document.querySelector('#command-button');
const commandClose = document.querySelector('#command-close');
const commandInput = document.querySelector('#command-input');
const commandList = document.querySelector('#command-list');

function runCommand(command) {
  dialog.close();
  if (command.external) window.open(command.target, '_blank', 'noopener');
  else document.querySelector(command.target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

function renderCommands(query = '') {
  const normalized = query.trim().toLowerCase();
  const filtered = commands.filter((command) => `${command.label} ${command.detail}`.toLowerCase().includes(normalized));
  commandList.innerHTML = filtered.map((command, index) => `<button type="button" data-command="${commands.indexOf(command)}"><span>${command.label}</span><span>${command.detail}${index === 0 ? ' · ↵' : ''}</span></button>`).join('') || '<p style="padding:.8rem;color:#7d8b94;font:400 .72rem var(--mono)">No matching command.</p>';
  commandList.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => runCommand(commands[Number(button.dataset.command)])));
}

function openCommands() {
  renderCommands();
  dialog.showModal();
  requestAnimationFrame(() => commandInput.focus());
}

commandButton?.addEventListener('click', openCommands);
commandClose?.addEventListener('click', () => dialog.close());
commandInput?.addEventListener('input', () => renderCommands(commandInput.value));
commandInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const first = commandList.querySelector('button');
    if (first) first.click();
  }
});
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});
addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    dialog.open ? dialog.close() : openCommands();
  }
});

const contactForm = document.querySelector('#contact-form');
contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const message = String(data.get('message') || '').trim();
  const subject = encodeURIComponent(`Portfolio conversation — ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  document.querySelector('#contact-status').textContent = 'Opening your email client…';
  window.location.href = `mailto:deghun@gmail.com?subject=${subject}&body=${body}`;
});

document.querySelector('#year').textContent = new Date().getFullYear();
