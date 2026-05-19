let modoCadastro = false;

document.addEventListener("DOMContentLoaded", () => {
  configurarMenuMobile();
  carregarLeituraAnual();
  configurarLogin();
  configurarContacto();
  configurarModais();
  carregarPainelDiscipulo();
  configurarLogout();
  configurarAdminTabs();
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
  const signupFields = document.getElementById("signup-fields");
  const loginBtn = document.getElementById("login-btn");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (modoCadastro) {
      await criarUsuarioComPerfil();
    } else {
      await entrarUsuario();
    }
  });

  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      modoCadastro = !modoCadastro;

      if (signupFields) {
        signupFields.style.display =
          modoCadastro ? "grid" : "none";
      }

      signupBtn.textContent =
        modoCadastro
          ? "Cancelar cadastro"
          : "Criar usuário";

      loginBtn.textContent =
        modoCadastro
          ? "Finalizar cadastro"
          : "Entrar";
    });
  }
}

async function entrarUsuario() {
  const client = getSupabase();

  if (!client) {
    alert("Supabase não configurado.");
    return;
  }

  const email =
    document.getElementById("email").value.trim();

  const password =
    document.getElementById("password").value;

  const { data, error } =
    await client.auth.signInWithPassword({
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

  const nome =
    document.getElementById("nome")?.value.trim();

  const email =
    document.getElementById("email")?.value.trim();

  const password =
    document.getElementById("password")?.value;

  const cargo =
    document.getElementById("cargo")?.value || "membro";

  if (!nome || !email || !password) {
    alert("Preenche nome, email e senha.");
    return;
  }

  /* =========================
     GERAR CÓDIGO M12
  ========================= */

  const { data: ultimoCodigo } =
    await client
      .from("profiles")
      .select("codigo_m12")
      .not("codigo_m12", "is", null)
      .order("created_at", {
        ascending: false
      })
      .limit(1);

  let novoCodigo = "M12-004";

  if (
    ultimoCodigo &&
    ultimoCodigo.length > 0
  ) {

    const ultimo =
      ultimoCodigo[0].codigo_m12;

    const numero =
      parseInt(
        ultimo.replace("M12-", "")
      );

    const proximo = numero + 1;

    novoCodigo =
      `M12-${String(proximo).padStart(3, "0")}`;
  }

  /* =========================
     CRIA AUTH
  ========================= */

  const { data, error } =
    await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          cargo,
        },
      },
    });

  if (error) {
    alert(
      "Erro ao criar usuário: " +
      error.message
    );

    return;
  }

  if (!data.user) {
    alert(
      "Usuário criado. Agora faça login."
    );

    return;
  }

  /* =========================
     PERFIL
  ========================= */

  const perfil = {
    id: data.user.id,
    nome,
    email,
    cargo,
    codigo_m12: novoCodigo,
  };

  const { error: profileError } =
    await client
      .from("profiles")
      .upsert(perfil, {
        onConflict: "id",
      });

  if (profileError) {
    alert(
      "Erro ao salvar perfil: " +
      profileError.message
    );

    return;
  }

  sessionStorage.setItem(
    "usuarioLogado",
    JSON.stringify(perfil)
  );

  redirecionarPorCargo(cargo);
}

async function verificarNivelAcesso(user) {
  const client = getSupabase();

  if (!client || !user) {
    alert("Sessão inválida.");
    return;
  }

  const { data: perfil, error } =
    await client
      .from("profiles")
      .select(`
        id,
        nome,
        email,
        cargo,
        foto_url,
        codigo_m12
      `)
      .eq("id", user.id)
      .single();

  if (error || !perfil) {
    alert("Perfil não encontrado.");
    return;
  }

  sessionStorage.setItem(
    "usuarioLogado",
    JSON.stringify(perfil)
  );

  redirecionarPorCargo(perfil.cargo);
}

function redirecionarPorCargo(cargo) {

  switch (cargo) {

    case "admin":
    case "dozefull":
      window.location.href =
        "admin.html";
      break;

    case "lider":
      window.location.href =
        "painel-discipulo.html";
      break;

    default:
      window.location.href =
        "painel-discipulo.html";
      break;
  }
}

/* =========================
   PAINEL DISCÍPULO
========================= */

async function carregarPainelDiscipulo() {

  const nomeEl =
    document.getElementById("cartao-nome");

  const emailEl =
    document.getElementById("cartao-email");

  const cargoEl =
    document.getElementById("cartao-cargo");

  const codigoEl =
    document.getElementById("cartao-codigo");

  if (
    !nomeEl ||
    !cargoEl ||
    !codigoEl
  ) return;

  const client = getSupabase();

  if (!client) {
    window.location.href =
      "login.html";
    return;
  }

  const { data: authData } =
    await client.auth.getUser();

  if (!authData.user) {
    window.location.href =
      "login.html";
    return;
  }

  const { data: perfil, error } =
    await client
      .from("profiles")
      .select(`
        nome,
        email,
        cargo,
        codigo_m12
      `)
      .eq("id", authData.user.id)
      .single();

  if (error || !perfil) {
    alert("Perfil não encontrado.");
    return;
  }

  nomeEl.textContent =
    perfil.nome || "Sem nome";

  if (emailEl) {
    emailEl.textContent =
      perfil.email || "---";
  }

  cargoEl.textContent =
    perfil.cargo || "membro";

  codigoEl.textContent =
    perfil.codigo_m12 || "---";
}

/* =========================
   LOGOUT
========================= */

function configurarLogout() {

  const logoutBtn =
    document.getElementById("logout-btn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener(
    "click",
    async () => {

      const client = getSupabase();

      if (client) {
        await client.auth.signOut();
      }

      sessionStorage.removeItem(
        "usuarioLogado"
      );

      window.location.href =
        "login.html";
    }
  );
}

/* =========================
   CONTACTO
========================= */

function configurarContacto() {

  const form =
    document.getElementById(
      "contact-form"
    );

  if (!form) return;

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const client = getSupabase();

      if (!client) {
        alert("Supabase não configurado.");
        return;
      }

      const nome =
        document.getElementById("nome")
        .value.trim();

      const email =
        document.getElementById("email")
        .value.trim();

      const mensagem =
        document.getElementById("mensagem")
        .value.trim();

      const { error } =
        await client
          .from("contactos")
          .insert([
            {
              nome,
              email,
              mensagem,
            },
          ]);

      if (error) {
        alert(
          "Erro ao enviar mensagem: " +
          error.message
        );

        return;
      }

      alert("Mensagem enviada!");
      form.reset();
    }
  );
}

/* =========================
   MODAIS
========================= */

function configurarModais() {

  document
    .querySelectorAll("[data-modal-target]")
    .forEach((botao) => {

      botao.addEventListener(
        "click",
        () => {

          const modalId =
            botao.dataset.modalTarget;

          const ficheiro =
            botao.dataset.file;

          const titulo =
            botao.dataset.title ||
            "Conteúdo";

          abrirModal(
            modalId,
            titulo,
            ficheiro
          );
        }
      );
    });

  document
    .querySelectorAll("[data-modal-close]")
    .forEach((botao) => {

      botao.addEventListener(
        "click",
        () => {

          fecharModal(
            botao.dataset.modalClose
          );
        }
      );
    });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        fecharModal(modal.id);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    document
      .querySelectorAll(".modal.active")
      .forEach((modal) => fecharModal(modal.id));
  });
}

async function abrirModal(
  modalId,
  titulo,
  ficheiro
) {

  const modal =
    document.getElementById(modalId);

  if (!modal) return;

  const titleEl =
    modal.querySelector(".modal-title");

  const bodyEl =
    modal.querySelector(".modal-body");

  if (titleEl) {
    titleEl.textContent = titulo;
  }

  if (bodyEl) {
    bodyEl.innerHTML =
      "<p>Carregando...</p>";
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  if (!ficheiro || !bodyEl) return;

  try {

    const response =
      await fetch(ficheiro);

    if (!response.ok) {
      throw new Error(
        "Ficheiro não encontrado."
      );
    }

    const texto =
      await response.text();

    bodyEl.innerHTML =
      `<pre>${texto}</pre>`;

  } catch {

    bodyEl.innerHTML =
      "<p>Erro ao carregar conteúdo.</p>";
  }
}

function fecharModal(modalId) {

  const modal =
    document.getElementById(modalId);

  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

/* =========================
   LEITURA ANUAL
========================= */

function carregarLeituraAnual() {

  const trechoBiblico =
    document.getElementById(
      "trecho-biblico"
    );

  const linkLeitura =
    document.getElementById(
      "link-leitura"
    );

  const dataAtual =
    document.getElementById("data-atual");

  const barraConcluida =
    document.getElementById("barra-concluida");

  const porcentagemAno =
    document.getElementById("porcentagem-ano");

  if (
    !trechoBiblico ||
    !linkLeitura
  ) return;

  const agora = new Date();

  const inicioAno =
    new Date(
      agora.getFullYear(),
      0,
      0
    );

  const diaDoAno =
    Math.floor(
      (agora - inicioAno) / 86400000
    );

  const fimAno =
    new Date(
      agora.getFullYear(),
      11,
      31
    );

  const totalDiasAno =
    Math.floor(
      (fimAno - inicioAno) / 86400000
    );

  const progresso =
    Math.min(
      100,
      Math.round((diaDoAno / totalDiasAno) * 100)
    );

  trechoBiblico.textContent =
    `Leitura do dia ${diaDoAno}`;

  linkLeitura.href =
    "https://www.bibliaonline.com.br";

  if (dataAtual) {
    dataAtual.textContent =
      agora.toLocaleDateString("pt-PT", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
  }

  if (barraConcluida) {
    barraConcluida.style.width =
      `${progresso}%`;
  }

  if (porcentagemAno) {
    porcentagemAno.textContent =
      `${progresso}% do ano concluído`;
  }
}

/* =========================
   ADMIN TABS
========================= */

function configurarAdminTabs() {

  const tabs =
    document.querySelectorAll(
      "[data-admin-tab]"
    );

  const sections =
    document.querySelectorAll(
      ".admin-section"
    );

  if (
    !tabs.length ||
    !sections.length
  ) return;

  tabs.forEach((tab) => {

    tab.addEventListener(
      "click",
      () => {

        const target =
          tab.dataset.adminTab;

        tabs.forEach((item) => {
          item.classList.remove("active");
        });

        sections.forEach((section) => {
          section.classList.remove("active");
        });

        tab.classList.add("active");

        const activeSection =
          document.getElementById(
            `admin-${target}`
          );

        if (activeSection) {
          activeSection.classList.add("active");
        }
      }
    );
  });
}
