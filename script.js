'use strict';

const SUPABASE_URL = 'https://qczmyahiitbtrmsoimxf.supabase.co';
const SUPABASE_ANON_KEY = 'COLOQUE_AQUI_A_SUA_ANON_KEY_PUBLICA';
const hasSupabase = window.supabase && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('COLOQUE_AQUI');
const supabaseClient = hasSupabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

function setupMobileMenu() {
  const button = document.getElementById('mobile-menu');
  const nav = document.getElementById('nav-list');
  if (!button || !nav) return;
  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('active');
    button.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      button.setAttribute('aria-expanded', 'false');
    });
  });
}

const bibleBooks = [
  ['Gênesis', 50], ['Êxodo', 40], ['Levítico', 27], ['Números', 36], ['Deuteronômio', 34], ['Josué', 24], ['Juízes', 21], ['Rute', 4], ['1 Samuel', 31], ['2 Samuel', 24], ['1 Reis', 22], ['2 Reis', 25], ['1 Crônicas', 29], ['2 Crônicas', 36], ['Esdras', 10], ['Neemias', 13], ['Ester', 10], ['Jó', 42], ['Salmos', 150], ['Provérbios', 31], ['Eclesiastes', 12], ['Cantares', 8], ['Isaías', 66], ['Jeremias', 52], ['Lamentações', 5], ['Ezequiel', 48], ['Daniel', 12], ['Oséias', 14], ['Joel', 3], ['Amós', 9], ['Obadias', 1], ['Jonas', 4], ['Miquéias', 7], ['Naum', 3], ['Habacuque', 3], ['Sofonias', 3], ['Ageu', 2], ['Zacarias', 14], ['Malaquias', 4], ['Mateus', 28], ['Marcos', 16], ['Lucas', 24], ['João', 21], ['Atos', 28], ['Romanos', 16], ['1 Coríntios', 16], ['2 Coríntios', 13], ['Gálatas', 6], ['Efésios', 6], ['Filipenses', 4], ['Colossenses', 4], ['1 Tessalonicenses', 5], ['2 Tessalonicenses', 3], ['1 Timóteo', 6], ['2 Timóteo', 4], ['Tito', 3], ['Filemom', 1], ['Hebreus', 13], ['Tiago', 5], ['1 Pedro', 5], ['2 Pedro', 3], ['1 João', 5], ['2 João', 1], ['3 João', 1], ['Judas', 1], ['Apocalipse', 22]
];

function slugBibleBook(name) {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}

function setupDailyReading() {
  const title = document.getElementById('trecho-biblico');
  const link = document.getElementById('link-leitura');
  const dateLabel = document.getElementById('data-atual');
  const bar = document.getElementById('barra-concluida');
  const percentText = document.getElementById('porcentagem-ano');
  if (!title || !link) return;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  const totalChapters = bibleBooks.reduce((sum, [, chapters]) => sum + chapters, 0);
  const chapterTarget = Math.max(1, Math.ceil((dayOfYear / 365) * totalChapters));

  let accumulated = 0;
  for (const [book, chapters] of bibleBooks) {
    if (accumulated + chapters >= chapterTarget) {
      const startChapter = Math.max(1, chapterTarget - accumulated);
      const endChapter = Math.min(chapters, startChapter + 2);
      title.textContent = `${book} ${startChapter}-${endChapter}`;
      link.href = `https://www.bibliaonline.com.br/acf/${slugBibleBook(book)}/${startChapter}`;
      break;
    }
    accumulated += chapters;
  }

  if (dateLabel) {
    dateLabel.textContent = now.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
  }
  const progress = Math.min(100, Math.round((dayOfYear / 365) * 100));
  if (bar) bar.style.width = `${progress}%`;
  if (percentText) percentText.textContent = `${progress}% do ano concluído`;
}

async function setupLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!supabaseClient) {
      alert('Supabase ainda não foi configurado. Adicione a ANON KEY pública no script.js.');
      return;
    }
    const email = form.email.value.trim();
    const password = form.password.value;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      alert(`Erro ao entrar: ${error.message}`);
      return;
    }
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id,nome,cargo,foto_url,codigo_m12')
      .eq('id', data.user.id)
      .single();
    if (profileError || !profile) {
      alert('Login feito, mas o perfil não foi encontrado.');
      return;
    }
    sessionStorage.setItem('usuarioLogado', JSON.stringify(profile));
    window.location.href = ['admin', 'dozefull'].includes(String(profile.cargo).toLowerCase()) ? 'admin.html' : 'painel-discipulo.html';
  });
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const nome = encodeURIComponent(form.nome.value.trim());
    const email = encodeURIComponent(form.email.value.trim());
    const mensagem = encodeURIComponent(form.mensagem.value.trim());
    window.location.href = `mailto:contatos@icr12mpu.com?subject=Mensagem de ${nome}&body=Email: ${email}%0D%0A%0D%0A${mensagem}`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupDailyReading();
  setupLogin();
  setupContactForm();
});
