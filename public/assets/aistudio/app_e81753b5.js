/**
 * AgroResiliente Inhambane — Auth + Interactive demo
 * Uses localStorage for simulated user accounts (frontend-only).
 */

(function () {
  "use strict";

  const STORAGE_USERS = "agro_users_v1";
  const STORAGE_SESSION = "agro_session_v1";

  // ---------- Storage helpers ----------
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null");
    } catch {
      return null;
    }
  }

  function setSession(user) {
    if (user) {
      localStorage.setItem(STORAGE_SESSION, JSON.stringify({
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email || "",
        zone: user.zone,
        crop: user.crop,
        type: user.type,
        plan: user.plan || "Gratuita",
        createdAt: user.createdAt
      }));
    } else {
      localStorage.removeItem(STORAGE_SESSION);
    }
  }

  function findUserByIdentifier(identifier) {
    const id = identifier.trim().toLowerCase();
    return getUsers().find(
      (u) =>
        u.phone.replace(/\s/g, "") === identifier.replace(/\s/g, "") ||
        (u.email && u.email.toLowerCase() === id)
    );
  }

  function generateId() {
    return "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // ---------- UI helpers ----------
  function showToast(message, type = "success") {
    const el = document.getElementById("toast");
    el.textContent = message;
    el.className = "toast " + type;
    el.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.hidden = true;
    }, 3200);
  }

  function openModal(id) {
    document.getElementById(id).hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.hidden = true;
    // only restore scroll if no other modal is open
    if (!document.querySelector(".modal-overlay:not([hidden])")) {
      document.body.style.overflow = "";
    }
  }

  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach((m) => (m.hidden = true));
    document.body.style.overflow = "";
  }

  // ---------- Auth UI ----------
  function renderSmsLoginBar() {
    const bar = document.getElementById("sms-login-bar");
    const text = document.getElementById("sms-login-text");
    const btn = document.getElementById("btn-sms-bar-login");
    if (!bar || !text || !btn) return;
    const session = getSession();
    if (session) {
      bar.classList.add("logged");
      text.textContent = "Ligado: " + session.name.split(" ")[0] + " · " + session.zone;
      btn.textContent = "Conta";
      btn.onclick = () => showView("account");
    } else {
      bar.classList.remove("logged");
      text.textContent = "Entre para alertas personalizados";
      btn.textContent = "Entrar";
      btn.onclick = () => openModal("modal-login");
    }
  }

  function renderAuthArea() {
    const area = document.getElementById("auth-area");
    const session = getSession();

    if (session) {
      const initials = session.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase();
      area.innerHTML = `
        <div class="user-chip">
          <span class="avatar">${initials}</span>
          <span class="user-name">${escapeHtml(session.name.split(" ")[0])}</span>
        </div>
        <button class="btn btn-ghost btn-sm" id="btn-account">Minha Conta</button>
        <button class="btn btn-outline btn-sm" id="btn-logout">Sair</button>
      `;
      document.getElementById("btn-account").addEventListener("click", () => showView("account"));
      document.getElementById("btn-logout").addEventListener("click", logout);
    } else {
      area.innerHTML = `
        <button class="btn btn-ghost btn-sm" id="btn-login">Entrar</button>
        <button class="btn btn-primary btn-sm" id="btn-register">Criar conta</button>
      `;
      document.getElementById("btn-login").addEventListener("click", () => openModal("modal-login"));
      document.getElementById("btn-register").addEventListener("click", () => openModal("modal-register"));
    }
    renderSmsLoginBar();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---------- Views ----------
  function showView(name) {
    const landing = document.getElementById("view-landing");
    const account = document.getElementById("view-account");

    if (name === "account") {
      const session = getSession();
      if (!session) {
        openModal("modal-login");
        return;
      }
      landing.hidden = true;
      account.hidden = false;
      renderAccount(session);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      landing.hidden = false;
      account.hidden = true;
    }
  }

  function renderAccount(session) {
    document.getElementById("account-greeting").textContent =
      "Olá, " + session.name.split(" ")[0];
    document.getElementById("account-subtitle").textContent =
      "Zona: " + session.zone + " · Cultura principal: " + session.crop;

    document.getElementById("account-plan").textContent = session.plan || "Gratuita";

    const dl = document.getElementById("profile-data");
    dl.innerHTML = `
      <dt>Nome</dt><dd>${escapeHtml(session.name)}</dd>
      <dt>Telefone</dt><dd>${escapeHtml(session.phone)}</dd>
      ${session.email ? `<dt>E-mail</dt><dd>${escapeHtml(session.email)}</dd>` : ""}
      <dt>Zona</dt><dd>${escapeHtml(session.zone)}</dd>
      <dt>Cultura</dt><dd>${escapeHtml(session.crop)}</dd>
      <dt>Tipo</dt><dd>${escapeHtml(session.type)}</dd>
      <dt>Membro desde</dt><dd>${formatDate(session.createdAt)}</dd>
    `;

    // Refresh account USSD (shows logged-in name on option 6)
    ussdState.account = "root";
    renderUssd("account");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("pt-MZ", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return iso;
    }
  }

  // ---------- Auth actions ----------
  function login(identifier, password) {
    const user = findUserByIdentifier(identifier);
    if (!user) {
      return { ok: false, error: "Conta não encontrada. Verifique o telefone ou e-mail." };
    }
    if (user.password !== password) {
      return { ok: false, error: "Palavra-passe incorrecta." };
    }
    setSession(user);
    return { ok: true, user };
  }

  function register(data) {
    const phone = data.phone.replace(/\s/g, "");
    if (!/^8[2-7]\d{7}$/.test(phone) && !/^\+2588[2-7]\d{7}$/.test(phone)) {
      // soft validation for Mozambican mobiles (82-87)
      // allow anyway but warn in message if clearly wrong
    }

    if (findUserByIdentifier(phone) || (data.email && findUserByIdentifier(data.email))) {
      return { ok: false, error: "Já existe uma conta com este telefone ou e-mail." };
    }
    if (data.password !== data.password2) {
      return { ok: false, error: "As palavras-passe não coincidem." };
    }
    if (data.password.length < 6) {
      return { ok: false, error: "A palavra-passe deve ter pelo menos 6 caracteres." };
    }

    const user = {
      id: generateId(),
      name: data.name.trim(),
      phone: phone,
      email: (data.email || "").trim().toLowerCase(),
      zone: data.zone,
      crop: data.crop,
      type: data.type,
      password: data.password,
      plan: "Gratuita",
      createdAt: new Date().toISOString()
    };

    const users = getUsers();
    users.push(user);
    saveUsers(users);
    setSession(user);
    return { ok: true, user };
  }

  function logout() {
    setSession(null);
    renderAuthArea();
    showView("landing");
    showToast("Sessão terminada.");
  }

  function updateProfile(updates) {
    const session = getSession();
    if (!session) return { ok: false, error: "Sessão expirada." };

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx === -1) return { ok: false, error: "Utilizador não encontrado." };

    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
    setSession(users[idx]);
    return { ok: true, user: users[idx] };
  }

  // ---------- USSD simulator ----------
  const ussdMenus = {
    root: `*123#
AgroResiliente
1. Precos de Mercado
2. Alertas Diarios
3. Boas Praticas
4. Falar com Extensionista
5. Vender / Comprar
6. Minha Conta`,

    "1": `Preços de Mercado
1. Mandioca   2. Milho
3. Amendoim   4. Feijão
5. Mapira     6. Caju
7. Hortícolas 8. Batata-doce
9. Mais culturas
0. Voltar`,

    "1.1": `Mandioca
Maxixe: 18–22 MT/kg
Homoíne: 16–20 MT/kg
Inhambane: 20–25 MT/kg
Massinga: 17–21 MT/kg
0. Voltar`,

    "1.2": `Milho
Maxixe: 28–35 MT/kg
Homoíne: 25–32 MT/kg
Inhambane: 30–38 MT/kg
Massinga: 27–34 MT/kg
0. Voltar`,

    "1.3": `Amendoim
Maxixe: 55–70 MT/kg
Homoíne: 50–65 MT/kg
Inhambane: 60–75 MT/kg
Massinga: 52–68 MT/kg
0. Voltar`,

    "1.4": `Feijão nhemba
Maxixe: 40–50 MT/kg
Homoíne: 38–48 MT/kg
Inhambane: 42–55 MT/kg
Massinga: 39–49 MT/kg
0. Voltar`,

    "1.5": `Mapira
Maxixe: 22–28 MT/kg
Homoíne: 20–26 MT/kg
Inhambane: 24–30 MT/kg
Massinga: 21–27 MT/kg
0. Voltar`,

    "1.6": `Caju
Maxixe: 35–45 MT/kg
Homoíne: 32–42 MT/kg
Inhambane: 38–48 MT/kg
Massinga: 33–43 MT/kg
0. Voltar`,

    "1.7": `Hortícolas
Tomate: 40–60 MT/kg
Cebola: 35–50 MT/kg
Couve: 25–35 MT/kg
Alface: 30–40 MT/kg
(Homoíne / Maxixe)
0. Voltar`,

    "1.8": `Batata-doce
Maxixe: 15–22 MT/kg
Homoíne: 14–20 MT/kg
Inhambane: 16–24 MT/kg
Massinga: 15–21 MT/kg
0. Voltar`,

    "1.9": `Mais culturas
1. Gergelim
2. Banana
3. Coco
4. Feijão boer
0. Voltar`,

    "1.9.1": `Gergelim
Maxixe: 80–100 MT/kg
Homoíne: 75–95 MT/kg
Inhambane: 85–105 MT/kg
Massinga: 78–98 MT/kg
0. Voltar`,

    "1.9.2": `Banana
Maxixe: 25–40 MT/kg
Homoíne: 22–35 MT/kg
Inhambane: 28–42 MT/kg
Massinga: 24–38 MT/kg
0. Voltar`,

    "1.9.3": `Coco
Maxixe: 15–25 MT/un
Homoíne: 12–22 MT/un
Inhambane: 18–28 MT/un
Massinga: 14–24 MT/un
0. Voltar`,

    "1.9.4": `Feijão boer
Maxixe: 45–58 MT/kg
Homoíne: 42–55 MT/kg
Inhambane: 48–62 MT/kg
Massinga: 44–56 MT/kg
0. Voltar`,

    "2": `Alertas da sua zona
• Chuva moderada prevista
  amanhã (Homoíne-Sede)
• Sem risco de pragas
  esta semana
• Vento fraco a moderado
0. Voltar`,

    "3": `Boas Práticas
1. Solo e fertilidade
2. Água / gota-a-gota
3. Sementes melhoradas
4. Pós-colheita
0. Voltar`,

    "3.1": `Solo e fertilidade
Use composto e cobertura
morta. Evite queimar
restos de cultura.
0. Voltar`,

    "3.2": `Água / gota-a-gota
Mulching reduz evaporação
em 30–40%. Priorize
regas de manhã cedo.
0. Voltar`,

    "3.3": `Sementes melhoradas
Prefira variedades
resistentes à seca
recomendadas para Inhambane.
0. Voltar`,

    "3.4": `Pós-colheita
Seque bem e armazene
em locais arejados e
limpos de pragas.
0. Voltar`,

    "4": `Falar com Extensionista
1. Pedir chamada
2. Enviar pergunta
0. Voltar`,

    "4.1": `Pedido registado.
Um extensionista
contactá-lo-á em breve.
0. Voltar`,

    "4.2": `Envie a sua pergunta
por SMS para 123
ou use a app.
0. Voltar`,

    "5": `Vender / Comprar
1. Publicar oferta
2. Ver pedidos
3. As minhas ordens
0. Voltar`,

    "5.1": `Para publicar oferta
use a app ou fale
com o agente de campo.
0. Voltar`,

    "5.2": `Pedidos activos:
• Mandioca 200kg
• Milho 50kg
• Amendoim 80kg
• Caju 120kg
• Mapira 60kg
0. Voltar`,

    "5.3": `Sem ordens activas.
0. Voltar`,

    "6": null // filled dynamically
  };

  // Independent paths for public simulator and account simulator
  const ussdState = {
    public: "root",
    account: "root"
  };

  function getUssdContent(path) {
    if (path === "6") {
      const s = getSession();
      if (s) {
        return `Minha Conta
Nome: ${s.name.split(" ")[0]}
Zona: ${s.zone}
Plano: ${s.plan || "Gratuita"}
1. Actualizar para Premium
0. Voltar`;
      }
      return `Minha Conta
(Faça login para ver
os seus dados)
1. Criar conta / Entrar
0. Voltar`;
    }
    if (path === "6.1") {
      const s = getSession();
      if (s) {
        return `Premium
Alertas prioritários +
formação certificada.
Contacte o agente
ou use a app.
0. Voltar`;
      }
      return `Para criar conta
use o botão
"Criar conta" no site.
0. Voltar`;
    }
    return ussdMenus[path] || ussdMenus.root;
  }

  function hasUssdPath(path) {
    return (
      path === "root" ||
      path === "6" ||
      path === "6.1" ||
      ussdMenus[path] !== undefined
    );
  }

  function renderUssd(which) {
    const path = ussdState[which];
    const id = which === "public" ? "ussd-content-public" : "ussd-content";
    const el = document.getElementById(id);
    if (el) el.textContent = getUssdContent(path);
  }

  function handleUssdKey(which, key) {
    let path = ussdState[which];
    if (key === "0") {
      if (path === "root") return;
      const parts = path.split(".");
      parts.pop();
      path = parts.length ? parts.join(".") : "root";
    } else {
      const next = path === "root" ? key : path + "." + key;
      if (hasUssdPath(next)) {
        path = next;
      }
    }
    ussdState[which] = path;
    renderUssd(which);
  }

  // ---------- Event wiring ----------
  function init() {
    renderAuthArea();

    // CTA register / login
    document.getElementById("btn-cta-register")?.addEventListener("click", () => {
      openModal("modal-register");
    });
    document.getElementById("btn-cta-login")?.addEventListener("click", () => {
      openModal("modal-login");
    });
    document.getElementById("btn-ussd-login")?.addEventListener("click", () => {
      openModal("modal-login");
    });
    document.getElementById("btn-sms-login")?.addEventListener("click", () => {
      openModal("modal-login");
    });
    document.getElementById("btn-sms-register")?.addEventListener("click", () => {
      openModal("modal-register");
    });

    function switchChannel(channel) {
      document.querySelectorAll(".channel-tab").forEach((t) => {
        t.classList.toggle("active", t.dataset.channel === channel);
      });
      document.getElementById("panel-ussd").hidden = channel !== "ussd";
      document.getElementById("panel-sms").hidden = channel !== "sms";
      const section = document.getElementById("ussd");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Channel tabs (USSD / SMS)
    document.querySelectorAll(".channel-tab").forEach((tab) => {
      tab.addEventListener("click", () => switchChannel(tab.dataset.channel));
    });
    document.getElementById("btn-switch-to-sms")?.addEventListener("click", () => switchChannel("sms"));
    document.getElementById("btn-switch-to-ussd")?.addEventListener("click", () => switchChannel("ussd"));
    document.getElementById("btn-hero-ussd")?.addEventListener("click", (e) => {
      e.preventDefault();
      switchChannel("ussd");
    });
    document.getElementById("btn-hero-sms")?.addEventListener("click", (e) => {
      e.preventDefault();
      switchChannel("sms");
    });

    // Logo → landing
    document.getElementById("logo-link").addEventListener("click", (e) => {
      e.preventDefault();
      showView("landing");
    });

    // Close buttons & overlay click
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const overlay = btn.closest(".modal-overlay");
        if (overlay) closeModal(overlay.id);
      });
    });
    document.querySelectorAll(".modal-overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllModals();
    });

    // Switch between login / register
    document.getElementById("switch-to-register").addEventListener("click", () => {
      closeModal("modal-login");
      openModal("modal-register");
    });
    document.getElementById("switch-to-login").addEventListener("click", () => {
      closeModal("modal-register");
      openModal("modal-login");
    });

    // Login form
    document.getElementById("form-login").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const errEl = document.getElementById("login-error");
      const result = login(fd.get("identifier"), fd.get("password"));
      if (!result.ok) {
        errEl.textContent = result.error;
        errEl.hidden = false;
        return;
      }
      errEl.hidden = true;
      e.target.reset();
      closeAllModals();
      renderAuthArea();
      showToast("Bem-vindo(a), " + result.user.name.split(" ")[0] + "!");
      showView("account");
    });

    // Register form
    document.getElementById("form-register").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const errEl = document.getElementById("register-error");
      const data = {
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        zone: fd.get("zone"),
        crop: fd.get("crop"),
        type: fd.get("type"),
        password: fd.get("password"),
        password2: fd.get("password2")
      };
      const result = register(data);
      if (!result.ok) {
        errEl.textContent = result.error;
        errEl.hidden = false;
        return;
      }
      errEl.hidden = true;
      e.target.reset();
      closeAllModals();
      renderAuthArea();
      showToast("Conta criada com sucesso! Bem-vindo(a).");
      showView("account");
    });

    // Edit profile
    document.getElementById("btn-edit-profile")?.addEventListener("click", () => {
      const s = getSession();
      if (!s) return;
      const form = document.getElementById("form-edit");
      form.name.value = s.name;
      form.zone.value = s.zone;
      form.crop.value = s.crop;
      form.type.value = s.type;
      openModal("modal-edit");
    });

    document.getElementById("form-edit").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const result = updateProfile({
        name: fd.get("name").trim(),
        zone: fd.get("zone"),
        crop: fd.get("crop"),
        type: fd.get("type")
      });
      if (!result.ok) {
        document.getElementById("edit-error").textContent = result.error;
        document.getElementById("edit-error").hidden = false;
        return;
      }
      closeModal("modal-edit");
      renderAuthArea();
      renderAccount(result.user);
      showToast("Perfil actualizado.");
    });

    // Upgrade
    document.getElementById("btn-upgrade")?.addEventListener("click", () => {
      const result = updateProfile({ plan: "Premium" });
      if (result.ok) {
        renderAccount(result.user);
        showToast("Conta actualizada para Premium (demo).");
      }
    });

    // Quick links
    document.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const messages = {
          prices: "Preços de mercado: use o simulador USSD ou aguarde a app.",
          alerts: "Os seus alertas aparecerão aqui quando o backend estiver activo.",
          practices: "Boas práticas disponíveis no menu USSD (opção 3).",
          extension: "Pedido de contacto com extensionista registado (simulação)."
        };
        showToast(messages[action] || "Em breve.");
      });
    });

    // USSD keys — public simulator (landing page)
    document.querySelectorAll(".ussd-keys-public button").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleUssdKey("public", btn.dataset.key);
      });
    });

    // USSD keys — account simulator
    document.querySelectorAll("#ussd-sim .ussd-keys button").forEach((btn) => {
      btn.addEventListener("click", () => {
        handleUssdKey("account", btn.dataset.key);
      });
    });

    // SMS simulator
    function appendSms(text, direction) {
      const thread = document.getElementById("sms-thread");
      if (!thread) return;
      const bubble = document.createElement("div");
      bubble.className = "sms-bubble " + direction;
      bubble.textContent = text;
      thread.appendChild(bubble);
      thread.scrollTop = thread.scrollHeight;
    }

    function replySms(command) {
      const cmd = command.trim().toUpperCase().replace(/\s+/g, " ");
      const session = getSession();
      const prices = {
        MANDIOCA: "Mandioca — Homoíne 16–20 MT/kg | Maxixe 18–22 | Inhambane 20–25 | Massinga 17–21",
        MILHO: "Milho — Homoíne 25–32 MT/kg | Maxixe 28–35 | Inhambane 30–38 | Massinga 27–34",
        AMENDOIM: "Amendoim — Homoíne 50–65 MT/kg | Maxixe 55–70 | Inhambane 60–75 | Massinga 52–68",
        "FEIJAO NHEMBA": "Feijão nhemba — Homoíne 38–48 MT/kg | Maxixe 40–50 | Inhambane 42–55",
        FEIJAO: "Feijão nhemba — Homoíne 38–48 MT/kg | Maxixe 40–50 | Inhambane 42–55",
        MAPIRA: "Mapira — Homoíne 20–26 MT/kg | Maxixe 22–28 | Inhambane 24–30 | Massinga 21–27",
        CAJU: "Caju — Homoíne 32–42 MT/kg | Maxixe 35–45 | Inhambane 38–48 | Massinga 33–43",
        HORTICOLAS: "Hortícolas (Homoíne/Maxixe): Tomate 40–60 | Cebola 35–50 | Couve 25–35 | Alface 30–40 MT/kg",
        HORTICOLA: "Hortícolas (Homoíne/Maxixe): Tomate 40–60 | Cebola 35–50 | Couve 25–35 | Alface 30–40 MT/kg",
        TOMATE: "Tomate — 40–60 MT/kg (Homoíne / Maxixe)",
        CEBOLA: "Cebola — 35–50 MT/kg (Homoíne / Maxixe)",
        BATATA: "Batata-doce — Homoíne 14–20 MT/kg | Maxixe 15–22 | Inhambane 16–24 | Massinga 15–21",
        "BATATA DOCE": "Batata-doce — Homoíne 14–20 MT/kg | Maxixe 15–22 | Inhambane 16–24 | Massinga 15–21",
        GERGELIM: "Gergelim — Homoíne 75–95 MT/kg | Maxixe 80–100 | Inhambane 85–105 | Massinga 78–98",
        BANANA: "Banana — Homoíne 22–35 MT/kg | Maxixe 25–40 | Inhambane 28–42 | Massinga 24–38",
        COCO: "Coco — Homoíne 12–22 MT/un | Maxixe 15–25 | Inhambane 18–28 | Massinga 14–24",
        BOER: "Feijão boer — Homoíne 42–55 MT/kg | Maxixe 45–58 | Inhambane 48–62 | Massinga 44–56",
        "FEIJAO BOER": "Feijão boer — Homoíne 42–55 MT/kg | Maxixe 45–58 | Inhambane 48–62 | Massinga 44–56"
      };

      if (cmd === "AJUDA" || cmd === "HELP" || cmd === "MENU") {
        return "AgroResiliente SMS\nComandos:\nPRECO [cultura]\nALERTA\nDICA [tema]\nAJUDA\nCulturas: mandioca, milho, amendoim, feijao, mapira, caju, horticola, batata, gergelim, banana, coco, boer";
      }
      if (cmd === "ALERTA" || cmd === "ALERTAS") {
        if (session) {
          return "Alertas para " + session.name.split(" ")[0] + " (" + session.zone + "):\n• Chuva moderada amanhã\n• Sem risco de pragas esta semana\n• Cultura " + session.crop + ": condições favoráveis";
        }
        return "Alertas Homoíne:\n• Chuva moderada amanhã (Sede)\n• Sem risco de pragas esta semana\n• Vento fraco a moderado\n(Entre na conta para alertas da sua zona)";
      }
      if (cmd.startsWith("DICA")) {
        const tema = cmd.replace(/^DICA\s*/, "") || "solo";
        const dicas = {
          SOLO: "Solo: use composto e cobertura morta. Evite queimar restos de cultura.",
          AGUA: "Água: mulching reduz evaporação 30–40%. Regue de manhã cedo.",
          SEMENTES: "Sementes: prefira variedades resistentes à seca recomendadas para Inhambane.",
          COLHEITA: "Pós-colheita: seque bem e armazene em local arejado e limpo de pragas."
        };
        const key = Object.keys(dicas).find((k) => tema.includes(k)) || "SOLO";
        return "Dica AgroResiliente — " + dicas[key];
      }
      if (cmd.startsWith("PRECO") || cmd.startsWith("PREÇO") || cmd.startsWith("PRECOS")) {
        const rest = cmd.replace(/^PRE[CÇ]OS?\s*/, "");
        const match = Object.keys(prices).find((k) => rest.includes(k) || k.includes(rest));
        if (match) return "Preço " + prices[match];
        return "Indique a cultura. Ex: PRECO milho\nCulturas: mandioca, milho, amendoim, feijao, mapira, caju, horticola, batata, gergelim, banana, coco, boer";
      }
      return "Não compreendi. Envie AJUDA para ver os comandos.";
    }

    function sendSms(text) {
      const msg = text.trim();
      if (!msg) return;
      appendSms(msg, "out");
      setTimeout(() => {
        appendSms(replySms(msg), "in");
      }, 450);
    }

    document.getElementById("form-sms")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("sms-input");
      sendSms(input.value);
      input.value = "";
      input.focus();
    });

    document.querySelectorAll("[data-sms]").forEach((btn) => {
      btn.addEventListener("click", () => {
        sendSms(btn.dataset.sms);
      });
    });

    // Initial render of public USSD
    renderUssd("public");
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
