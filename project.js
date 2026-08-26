(function () {
  const serviceStatus = document.querySelector('#project-service-status');

  function setProjectServiceStatus(message, state = 'standby') {
    if (!serviceStatus) return;
    serviceStatus.textContent = message;
    serviceStatus.dataset.state = state;
  }

  window.setProjectServiceStatus = setProjectServiceStatus;
  document.querySelectorAll('[data-project-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const commandDialog = document.querySelector('#command-dialog');
  const commandButton = document.querySelector('#command-button');
  const commandClose = document.querySelector('#command-close');
  const commandInput = document.querySelector('#command-input');
  const commandList = document.querySelector('#command-list');
  const projectCommands = [
    { label: './home', detail: 'Introduction', target: 'index.html#home' },
    { label: './experience', detail: 'Career log', target: 'index.html#experience' },
    { label: './writing', detail: 'Engineering notes', target: 'index.html#writing' },
    { label: './skills', detail: 'Technical skills', target: 'index.html#skills' },
    { label: './systems', detail: 'Interactive case studies', target: 'index.html#systems' },
    { label: './contact', detail: 'Start a conversation', target: 'index.html#contact' },
    { label: 'open résumé', detail: 'Google Drive ↗', target: 'https://drive.google.com/file/d/1dh3HAQpWbVnPlSdPzVh4nB1KLcUPBLRP/view?usp=sharing', external: true }
  ];

  function runProjectCommand(command) {
    commandDialog?.close();
    if (command.external) window.open(command.target, '_blank', 'noopener');
    else window.location.href = command.target;
  }

  function renderProjectCommands(query = '') {
    if (!commandList) return;
    const normalized = query.trim().toLowerCase();
    const filtered = projectCommands.filter((command) => `${command.label} ${command.detail}`.toLowerCase().includes(normalized));
    commandList.innerHTML = filtered.map((command, index) => `<button type="button" data-project-command="${projectCommands.indexOf(command)}"><span>${command.label}</span><span>${command.detail}${index === 0 ? ' · ↵' : ''}</span></button>`).join('') || '<p style="padding:.8rem;color:#7d8b94;font:400 .72rem var(--mono)">No matching command.</p>';
    commandList.querySelectorAll('[data-project-command]').forEach((button) => {
      button.addEventListener('click', () => runProjectCommand(projectCommands[Number(button.dataset.projectCommand)]));
    });
  }

  function openProjectCommands() {
    if (!commandDialog || !commandInput) return;
    renderProjectCommands();
    commandDialog.showModal();
    requestAnimationFrame(() => commandInput.focus());
  }

  commandButton?.addEventListener('click', openProjectCommands);
  commandClose?.addEventListener('click', () => commandDialog?.close());
  commandInput?.addEventListener('input', () => renderProjectCommands(commandInput.value));
  commandInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') commandList?.querySelector('button')?.click();
  });
  commandDialog?.addEventListener('click', (event) => {
    if (event.target === commandDialog) commandDialog.close();
  });
  addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      commandDialog?.open ? commandDialog.close() : openProjectCommands();
    }
  });

  addEventListener('offline', () => {
    setProjectServiceStatus('You appear to be offline. The case study remains available; the live service does not.', 'error');
  });

  addEventListener('online', () => {
    setProjectServiceStatus('Connection restored. The live service may take a few seconds to respond.', 'standby');
  });

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (...argumentsList) => {
    const request = argumentsList[0];
    const requestUrl = typeof request === 'string' ? request : request?.url;
    let externalRequest = false;

    try {
      externalRequest = Boolean(requestUrl && new URL(requestUrl, location.href).origin !== location.origin);
    } catch {
      externalRequest = false;
    }

    try {
      const response = await nativeFetch(...argumentsList);
      if (externalRequest) {
        setProjectServiceStatus(
          response.ok
            ? 'Live service is responding.'
            : `Live service returned ${response.status}. The case study is still available below.`,
          response.ok ? 'online' : 'error'
        );
      }
      return response;
    } catch (error) {
      if (externalRequest) {
        setProjectServiceStatus('Live service is temporarily unavailable. The case study and API examples remain available.', 'error');
      }
      throw error;
    }
  };
})();
