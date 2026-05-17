document.addEventListener("DOMContentLoaded", () => {
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

  carregarLeituraAnual();
  configurarLogin();
  configurarContacto();
  configurarModais();
  carregarPainelDiscipulo();
});

/* =========================
   LOGIN SUPABASE
========================= */

function getSupabase() {
  return window.supabaseClient || null;
}

function configurarLogin() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const client = getSupabase();

    if (!client) {
      alert("Supabase não configurado. Verifica o ficheiro supabase-config.js.");
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

    verificarNivelAcesso(data.user);
  });
}

async function verificarNivelAcesso(user) {
  const client = getSupabase();

  const { data, error } = await client
    .from("profiles")
    .select("id, nome, email, cargo, foto_url, codigo_m12")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    alert("Perfil não encontrado na tabela profiles.");
    return;
  }

  sessionStorage.setItem("usuarioLogado", JSON.stringify(data));

  if (data.cargo === "admin" || data.cargo === "dozefull") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "painel-discipulo.html";
  }
}

/* =========================
   FORMULÁRIO DE CONTACTO
========================= */

function configurarContacto() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

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
   PAINEL DO DISCÍPULO
========================= */

function carregarPainelDiscipulo() {
  const nomeEl = document.getElementById("cartao-nome");
  const cargoEl = document.getElementById("cartao-cargo");
  const codigoEl = document.getElementById("cartao-codigo");

  if (!nomeEl || !cargoEl || !codigoEl) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  nomeEl.textContent = usuario.nome || "Nome do discípulo";
  cargoEl.textContent = usuario.cargo || "Cargo / função";
  codigoEl.textContent = usuario.codigo_m12 || "---";
}

/* =========================
   MODAIS DE ESTUDOS / NOTÍCIAS / DECRETOS
========================= */

function configurarModais() {
  document.querySelectorAll("[data-modal-target]").forEach((botao) => {
    botao.addEventListener("click", async () => {
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
    bodyEl.innerHTML = `<p>Erro ao carregar conteúdo.</p>`;
  }
}

function fecharModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
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
      linkLeitura.href = `https://www.bibliaonline.com.br/acf/${livro.slug}/${capitulo}`;
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