document.addEventListener("DOMContentLoaded", () => {
  configurarMenuMobile();
  carregarLeituraAnual();
  configurarLogin();
  configurarContacto();
  configurarModais();
  carregarPainelDiscipulo();
  configurarLogout();
});

/* =========================
   MENU MOBILE
========================= */

function configurarMenuMobile() {
  const mobileMenu = document.getElementById("mobile-menu");
  const navList = document.getElementById("nav-list");

  if (mobileMenu && navList) {
    mobileMenu.addEventListener("click", () => {
      navList.classList.toggle("active");

      mobileMenu.setAttribute(
        "aria-expanded",
        navList.classList.contains("active")
      );
    });
  }

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navList?.classList.remove("active");
    });
  });
}

/* =========================
   SUPABASE
========================= */

function getSupabase() {
  return window.supabaseClient || null;
}

/* =========================
   LOGIN / CADASTRO
========================= */

function configurarLogin() {
  const loginForm = document.getElementById("login-form");
  const signupBtn = document.getElementById("signup-btn");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await entrarUsuario();
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      await criarUsuarioComPerfil();
    });
  }
}

async function entrarUsuario() {
  const client = getSupabase();

  if (!client) {
    alert("Supabase não configurado.");
    return;
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Erro ao entrar: " + error.message);
    return;
  }

  await verificarNivelAcesso(data.user);
}

async function criarUsuarioComPerfil() {
  const client = getSupabase();

  if (!client) {
    alert("Supabase não configurado.");
    return;
  }

  const nome = document.getElementById("nome")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  const cargo = document.getElementById("cargo")?.value || "membro";
  const codigo_m12 = document.getElementById("codigo_m12")?.value.trim();

  if (!nome || !email || !password) {
    alert("Preenche nome, email e senha.");
    return;
  }

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
        cargo,
        codigo_m12,
      },
    },
  });

  if (error) {
    alert("Erro ao criar usuário: " + error.message);
    return;
  }

  if (!data.user) {
    alert("Usuário criado. Agora faça login.");
    return;
  }

  const perfil = {
    id: data.user.id,
    nome,
    email,
    cargo,
    codigo_m12,
  };

  const { error: profileError } = await client
    .from("profiles")
    .upsert(perfil, { onConflict: "id" });

  if (profileError) {
    alert("Usuário criado, mas erro ao salvar perfil: " + profileError.message);
    return;
  }

  sessionStorage.setItem("usuarioLogado", JSON.stringify(perfil));

  redirecionarPorCargo(cargo);
}

async function verificarNivelAcesso(user) {
  const client = getSupabase();

  if (!client || !user) {
    alert("Sessão inválida.");
    return;
  }

  const { data: perfil, error } = await client
    .from("profiles")
    .select("id, nome, email, cargo, foto_url, codigo_m12")
    .eq("id", user.id)
    .single();

  if (error || !perfil) {
    alert("Perfil não encontrado. Complete o cadastro ou fale com a administração.");
    return;
  }

  sessionStorage.setItem("usuarioLogado", JSON.stringify(perfil));

  redirecionarPorCargo(perfil.cargo);
}

function redirecionarPorCargo(cargo) {
  switch (cargo) {
    case "admin":
    case "dozefull":
      window.location.href = "admin.html";
      break;

    case "lider":
      window.location.href = "painel-lider.html";
      break;

    case "discipulo":
    case "membro":
      window.location.href = "painel-discipulo.html";
      break;

    default:
      window.location.href = "painel-discipulo.html";
      break;
  }
}

/* =========================
   PAINEL DO DISCÍPULO
========================= */

async function carregarPainelDiscipulo() {
  const nomeEl = document.getElementById("cartao-nome");
  const emailEl = document.getElementById("cartao-email");
  const cargoEl = document.getElementById("cartao-cargo");
  const codigoEl = document.getElementById("cartao-codigo");

  if (!nomeEl || !cargoEl || !codigoEl) return;

  const client = getSupabase();

  if (!client) {
    alert("Supabase não configurado.");
    window.location.href = "login.html";
    return;
  }

  const { data: authData } = await client.auth.getUser();

  if (!authData.user) {
    window.location.href = "login.html";
    return;
  }

  const { data: perfil, error } = await client
    .from("profiles")
    .select("nome, email, cargo, codigo_m12")
    .eq("id", authData.user.id)
    .single();

  if (error || !perfil) {
    alert("Perfil não encontrado.");
    window.location.href = "login.html";
    return;
  }

  nomeEl.textContent = perfil.nome || "Nome não informado";

  if (emailEl) {
    emailEl.textContent = perfil.email || authData.user.email;
  }

  cargoEl.textContent = perfil.cargo || "membro";
  codigoEl.textContent = perfil.codigo_m12 || "---";
}

/* =========================
   LOGOUT
========================= */

function configurarLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const client = getSupabase();

    if (client) {
      await client.auth.signOut();
    }

    sessionStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
  });
}

/* =========================
   FORMULÁRIO DE CONTACTO
========================= */

function configurarContacto() {
  const form = document.getElementById("contact-form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const client = getSupabase();

    if (!client) {
      alert("Supabase não configurado.");
      return;
    }

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    const { error } = await client.from("contactos").insert([
      {
        nome,
        email,
        mensagem,
      },
    ]);

    if (error) {
      alert("Erro ao enviar mensagem: " + error.message);
      return;
    }

    alert("Mensagem enviada com sucesso!");
    form.reset();
  });
}

/* =========================
   MODAIS
========================= */

function configurarModais() {
  document.querySelectorAll("[data-modal-target]").forEach((botao) => {
    botao.addEventListener("click", () => {
      const modalId = botao.dataset.modalTarget;
      const ficheiro = botao.dataset.file;
      const titulo = botao.dataset.title || "Conteúdo";

      abrirModal(modalId, titulo, ficheiro);
    });
  });

  document.querySelectorAll("[data-modal-close]").forEach((botao) => {
    botao.addEventListener("click", () => {
      fecharModal(botao.dataset.modalClose);
    });
  });
}

async function abrirModal(modalId, titulo, ficheiro) {
  const modal = document.getElementById(modalId);

  if (!modal) return;

  const titleEl = modal.querySelector(".modal-title");
  const bodyEl = modal.querySelector(".modal-body");

  if (titleEl) titleEl.textContent = titulo;
  if (bodyEl) bodyEl.innerHTML = "<p>Carregando...</p>";

  modal.classList.add("active");

  if (!ficheiro || !bodyEl) return;

  try {
    const response = await fetch(ficheiro);

    if (!response.ok) {
      throw new Error("Ficheiro não encontrado.");
    }

    const texto = await response.text();
    bodyEl.innerHTML = `<pre>${texto}</pre>`;
  } catch (error) {
    bodyEl.innerHTML = "<p>Erro ao carregar conteúdo.</p>";
  }
}

function fecharModal(modalId) {
  const modal = document.getElementById(modalId);

  if (modal) {
    modal.classList.remove("active");
  }
}

/* =========================
   LEITURA ANUAL
========================= */

function carregarLeituraAnual() {
  const trechoBiblico = document.getElementById("trecho-biblico");
  const linkLeitura = document.getElementById("link-leitura");

  if (!trechoBiblico || !linkLeitura) return;

  const agora = new Date();
  const inicioAno = new Date(agora.getFullYear(), 0, 0);
  const diaDoAno = Math.floor((agora - inicioAno) / 86400000);

  const biblia = [
    { n: "Gênesis", slug: "genesis", c: 50 },
    { n: "Êxodo", slug: "exodo", c: 40 },
    { n: "Levítico", slug: "levitico", c: 27 },
    { n: "Números", slug: "numeros", c: 36 },
    { n: "Deuteronômio", slug: "deuteronomio", c: 34 },
    { n: "Josué", slug: "josue", c: 24 },
    { n: "Juízes", slug: "juizes", c: 21 },
    { n: "Rute", slug: "rute", c: 4 },
    { n: "1 Samuel", slug: "1-samuel", c: 31 },
    { n: "2 Samuel", slug: "2-samuel", c: 24 },
    { n: "Salmos", slug: "salmos", c: 150 },
    { n: "Mateus", slug: "mateus", c: 28 },
    { n: "Marcos", slug: "marcos", c: 16 },
    { n: "Lucas", slug: "lucas", c: 24 },
    { n: "João", slug: "joao", c: 21 },
    { n: "Romanos", slug: "romanos", c: 16 },
    { n: "Apocalipse", slug: "apocalipse", c: 22 },
  ];

  let metaCapitulo = Math.max(1, Math.ceil(diaDoAno * 3.25));
  let acumulado = 0;
  let leitura = "Gênesis 1";

  for (const livro of biblia) {
    if (acumulado + livro.c >= metaCapitulo) {
      const capitulo = metaCapitulo - acumulado;

      leitura = `${livro.n} ${capitulo}`;
      linkLeitura.href =
        `https://www.bibliaonline.com.br/acf/${livro.slug}/${capitulo}`;

      break;
    }

    acumulado += livro.c;
  }

  trechoBiblico.textContent = leitura;

  const dataAtual = document.getElementById("data-atual");

  if (dataAtual) {
    dataAtual.textContent = agora.toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
    });
  }

  const progresso = Math.round((diaDoAno / 365) * 100);
  const barra = document.getElementById("barra-concluida");
  const texto = document.getElementById("porcentagem-ano");

  if (barra) barra.style.width = `${progresso}%`;
  if (texto) texto.textContent = `${progresso}% do ano concluído`;
}