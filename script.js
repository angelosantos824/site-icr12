
// ===========================================================================
//                 //    SUPABASE - EXEMPLO DE LEITURA  //
// ===========================================================================
// Configuração do Supabase (Substitui pelas tuas chaves do projeto ICR12)
// 1. Configuração (Usa as chaves que aparecem no teu painel do Supabase)
const supabaseUrl = 'https://qczmyahiitbtrmsoimxf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjem15YWhpaXRidHJtc29pbXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkyMTIsImV4cCI6MjA5NDM0NTIxMn0.tN8coprZC5mXV50t0IXPEIPl2ZGU8-t3Qygcp_mUAp8';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Lógica do Formulário de Login
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Tenta fazer o login usando o supabaseClient que definimos no topo
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('Erro ao entrar: ' + error.message);
        } else {
            // Se o login funcionar, chamamos a função de verificação
            verificarNivelAcesso(data.user);
        }
    }); // Fecho correto do event listener
}

// 3. Função de Redirecionamento (Admin vs Membro)
async function verificarNivelAcesso(user) {
    const { data } = await supabaseClient
        .from('profiles')
        .select('cargo, nome, foto_url, codigo_m12')
        .eq('id', user.id)
        .single();

    if (data) {
        // Guarda os dados na sessão para a carteira usar
        sessionStorage.setItem('usuarioLogado', JSON.stringify(data));

        if (data.cargo === 'admin' || data.cargo === 'dozefull') {
            window.location.href = 'admin.html';
        } else {
            // Todos os outros (Pastores, 144, Discípulos) vão para o painel personalizado
            window.location.href = 'painel-discipulo.html';
        }
    }
}
// --- Lógica de Criação de Usuário (CRUD) ---

async function salvarNovoUsuario() {
    // 1. Captura os valores dos campos do seu formulário no admin.html
    const nome = document.getElementById('input-nome').value;
    const email = document.getElementById('input-email').value;
    const cargoSelecionado = document.getElementById('select-cargo').value;

    // 2. A sua REGRA DE SEGURANÇA (Coloque aqui)
    if (cargoSelecionado === 'dozefull') {
        alert("Erro: Este cargo é exclusivo do Administrador Geral.");
        return; // O código para aqui e não envia nada ao Supabase
    }

    // 3. Se passar na regra, envia para o Supabase
    try {
        // Primeiro cria o acesso no Auth (precisaria de uma Edge Function ou lógica de Admin)
        // Por agora, vamos focar em inserir na tabela 'profiles'
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert([
                { nome: nome, cargo: cargoSelecionado, email: email }
            ]);

        if (error) throw error;

        alert("Usuário criado com sucesso!");
        carregarListaUsuarios(); // Função para atualizar a tabela na tela
    } catch (error) {
        alert("Erro ao salvar: " + error.message);
    }
}

async function carregarListaUsuarios(usuarioLogado) {
    let query = supabaseClient.from('profiles').select('*');

    // Regras de Visualização baseadas no cargo
    if (usuarioLogado.cargo === 'dozefull') {
        // Não filtra nada, vê tudo
    } else if (usuarioLogado.cargo === 'Apóstolo') {
        query = query.in('cargo', ['pastor', 'doze', '144', 'discipulo']);
    } else if (usuarioLogado.cargo === 'Pastor' || usuarioLogado.cargo === 'doze') {
        query = query.in('cargo', ['doze', '144', 'discipulo']);
    } else if (usuarioLogado.cargo === '144') {
        query = query.eq('cargo', 'discipulo');
    } else {
        // Discípulo vê apenas o seu ID
        query = query.eq('id', usuarioLogado.id);
    }

    const { data, error } = await query;
    // ... lógica para renderizar a tabela no HTML
}

function closeLiveModal() {
    const modal = document.getElementById('modalCulto');
    modal.style.display = 'none';
    
    // Opcional: Para o vídeo parar de tocar quando fechar a modal
    const iframe = modal.querySelector('iframe');
    const url = iframe.src;
    iframe.src = '';
    iframe.src = url;
}

// Abrir automaticamente após 2 segundos
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('modalCulto').style.display = 'flex';
    }, 30000);
});

// */===========================================================================
//                 //    PALAVRA DIARIA  //
// ==============================================================================*/

document.addEventListener('DOMContentLoaded', function() {
    const agora = new Date();
    const inicioAno = new Date(agora.getFullYear(), 0, 0);
    const dif = agora - inicioAno;
    const umDia = 1000 * 60 * 60 * 24;
    const diaDoAno = Math.floor(dif / umDia);

    // Estrutura simplificada da Bíblia (Livros e Qtd de Capítulos)
    const biblia = [
        { n: "Gênesis", c: 50 }, { n: "Êxodo", c: 40 }, { n: "Levítico", c: 27 }, { n: "Números", c: 36 },
        { n: "Deuteronômio", c: 34 }, { n: "Josué", c: 24 }, { n: "Juízes", c: 21 }, { n: "Rute", c: 4 },
        { n: "1 Samuel", c: 31 }, { n: "2 Samuel", c: 24 }, { n: "1 Reis", c: 22 }, { n: "2 Reis", c: 25 },
        { n: "1 Crônicas", c: 29 }, { n: "2 Crônicas", c: 36 }, { n: "Esdras", c: 10 }, { n: "Neemias", c: 13 },
        { n: "Ester", c: 10 }, { n: "Jó", c: 42 }, { n: "Salmos", c: 150 }, { n: "Provérbios", c: 31 },
        { n: "Eclesiastes", c: 12 }, { n: "Cantares", c: 8 }, { n: "Isaías", c: 66 }, { n: "Jeremias", c: 52 },
        { n: "Lamentações", c: 5 }, { n: "Ezequiel", c: 48 }, { n: "Daniel", c: 12 }, { n: "Oséias", c: 14 },
        { n: "Joel", c: 3 }, { n: "Amós", c: 9 }, { n: "Obadias", c: 1 }, { n: "Jonas", c: 4 },
        { n: "Miquéias", c: 7 }, { n: "Naum", c: 3 }, { n: "Habacuque", c: 3 }, { n: "Sofonias", c: 3 },
        { n: "Ageu", c: 2 }, { n: "Zacarias", c: 14 }, { n: "Malaquias", c: 4 }, { n: "Mateus", c: 28 },
        { n: "Marcos", c: 16 }, { n: "Lucas", c: 24 }, { n: "João", c: 21 }, { n: "Atos", c: 28 },
        { n: "Romanos", c: 16 }, { n: "1 Coríntios", c: 16 }, { n: "2 Coríntios", c: 13 }, { n: "Gálatas", c: 6 },
        { n: "Efésios", c: 6 }, { n: "Filipenses", c: 4 }, { n: "Colossenses", c: 4 }, { n: "1 Tessalonicenses", c: 5 },
        { n: "2 Tessalonicenses", c: 3 }, { n: "1 Timóteo", c: 6 }, { n: "2 Timóteo", c: 4 }, { n: "Tito", c: 3 },
        { n: "Filemom", c: 1 }, { n: "Hebreus", c: 13 }, { n: "Tiago", c: 5 }, { n: "1 Pedro", c: 5 },
        { n: "2 Pedro", c: 3 }, { n: "1 João", c: 5 }, { n: "2 João", c: 1 }, { n: "3 João", c: 1 },
        { n: "Judas", c: 1 }, { n: "Apocalipse", c: 22 }
    ];

    // Cálculo: 1189 capítulos / 365 dias ≈ 3.25 capítulos por dia
   // Procura os elementos uma única vez
const linkLeitura = document.getElementById('link-leitura');
const trechoBiblico = document.getElementById('trecho-biblico');

// Só executa a lógica se o elemento 'link-leitura' existir na página atual
if (linkLeitura) {
    for (let livro of biblia) {
        if (acumulado + livro.c >= metaCapitulo) {
            let inicio = Math.max(1, metaCapitulo - acumulado);
            let fim = Math.min(livro.c, inicio + 2);
            leituraHoje = `${livro.n} ${inicio}-${fim}`;
            
            const slug = livro.n.toLowerCase().replace(/ /g, "-");
            linkLeitura.href = `https://www.bibliaonline.com.br/acf/${slug}/${inicio}`;
            break;
        }
        acumulado += livro.c;
    }

    // Atualização da UI (apenas se os elementos existirem)
    if (trechoBiblico) trechoBiblico.innerText = leituraHoje;
    
    const dataAtual = document.getElementById('data-atual');
    if (dataAtual) dataAtual.innerText = agora.toLocaleDateString('pt-PT', {day:'numeric', month:'long'});
    
    const barra = document.getElementById('barra-concluida');
    if (barra) {
        const progresso = (diaDoAno / 365) * 100;
        barra.style.width = progresso + "%";
        const porcTexto = document.getElementById('porcentagem-ano');
        if (porcTexto) porcTexto.innerText = Math.round(progresso) + "% do ano concluído";
    }
}

/* ============================================================================
                //    MODAL DE ESTUDOS  //
============================================================================= */   

// Abre o modal e carrega o ficheiro de texto correspondente
async function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';

    // Define qual ficheiro ler baseado no ID
    const ficheiro = modalId === 'modal12' ? 'estudo12.txt' : 'estudocelula.txt';
    const containerId = modalId === 'modal12' ? 'conteudo-12' : 'conteudo-celula';

    try {
        const response = await fetch(ficheiro);
        const texto = await response.text();
        document.getElementById(containerId).innerHTML = `<div class="texto-formatado">${texto}</div>`;    } catch (error) {
        document.getElementById(containerId).innerHTML = "<p>Erro ao carregar o estudo. Tente novamente.</p>";
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Lógica do Menu Hambúrguer
const mobileMenu = document.getElementById('mobile-menu');
const navList = document.getElementById('nav-list');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navList.classList.toggle('active');
    });
}

// Fecha o menu ao clicar em qualquer link (opcional, melhora a UX)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navList.classList.remove('active');
    });
});

// ==================================================================
//                 //    JSON - LEITURA E ESCRITA  //
// ==================================================================
// Exemplo de conversão entre JSON e objeto JavaScript
async function carregarDadosDiscipulo() {
    // 1. Pega o utilizador atual do Supabase Auth
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
        // 2. Procura na tabela 'profiles' os dados que vieram do CSV/Form
        const { data: perfil, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('email', user.email) // Liga o login ao e-mail da tabela do Google Form
            .single();

        if (perfil) {
            // 3. Preenche o HTML com os dados da image_77d959.png
            document.getElementById('user-nome').innerText = perfil.nome;
            document.getElementById('cartao-nome').innerText = perfil.nome.toUpperCase();
            document.getElementById('cartao-titulo').innerText = perfil.titulo;
            document.getElementById('cartao-funcao').innerText = perfil.funcao;
            document.getElementById('cartao-nasc').innerText = perfil.nascimento;
            document.getElementById('cartao-rg').innerText = perfil.rg;
            
            // Se tiveres a coluna da foto
            if(perfil.foto_url) {
                document.getElementById('cartao-foto').src = perfil.foto_url;
            }
        }
    }
}

// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDadosDiscipulo);

// Dentro da tua função de carregar dados:
if (perfil) {
    document.getElementById('display-codigo-m12').innerText = perfil.codigo_m12;
    // ... resto dos dados (Nome, Cargo, etc)
}

async function carregarDadosDoDiscipulo() {
    // 1. Obtém o utilizador logado atualmente
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
        // 2. Procura na tabela os dados importados usando o E-mail como chave
        const { data: perfil, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('E-mail', user.email) 
            .single();

        if (perfil) {
            // 3. Preenche os campos do Cartão (image_782bd4.jpg)
            document.getElementById('cartao-nome').innerText = perfil.Nome;
            document.getElementById('cartao-cargo').innerText = perfil.Cargo;
            document.getElementById('cartao-funcao').innerText = perfil.funcao;
            document.getElementById('cartao-codigo').innerText = perfil.codigo_m12;
            document.getElementById('cartao-rg').innerText = perfil.RG;
            document.getElementById('cartao-nasc').innerText = perfil.Data_de_nascimento;
            
            // Define a foto (se não tiver, usa uma padrão)
            const fotoElemento = document.getElementById('cartao-foto');
            fotoElemento.src = perfil.foto_url || 'img/default-user.png';
        }
    }
}

function previewFoto(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('cartao-foto').src = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
        // Próximo passo será o upload para o Supabase Storage
    }
}

// Esta função seria chamada logo após o usuário escolher a foto
async function uploadFoto(file) {
    const user = supabase.auth.user();
    const fileName = `public/${user.id}.png`; // Nomeia a foto com o ID do usuário

    // 1. Envia para o Storage
    let { error: uploadError } = await supabase.storage
        .from('fotos-discipulos')
        .upload(fileName, file);

    // 2. Se correu bem, pega a URL pública
    const { publicURL } = supabase.storage
        .from('fotos-discipulos')
        .getPublicUrl(fileName);

    // 3. Atualiza a tabela 'profiles' com o link da foto
    await supabase
        .from('profiles')
        .update({ foto_url: publicURL })
        .eq('id', user.id);
}

async function organizarDados() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        const { data: perfil } = await supabase
            .from('profiles')
            .select('*')
            .eq('E-mail', user.email)
            .single();

        if (perfil) {
            document.getElementById('display-nome').innerText = perfil.Nome;
            document.getElementById('display-cargo').innerText = perfil.Cargo;
            document.getElementById('display-funcao').innerText = perfil.funcao;
            document.getElementById('display-cod').innerText = perfil.codigo_m12;
            document.getElementById('display-rg').innerText = perfil.RG;
        }
    }
}

// Inicia a organização
organizarDados();