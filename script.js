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
    let metaCapitulo = Math.floor(diaDoAno * 3.25);
    let acumulado = 0;
    let leituraHoje = "";

    for (let livro of biblia) {
        if (acumulado + livro.c >= metaCapitulo) {
            let inicio = Math.max(1, metaCapitulo - acumulado);
            let fim = Math.min(livro.c, inicio + 2);
            leituraHoje = `${livro.n} ${inicio}-${fim}`;
            
            // Link dinâmico para a Bíblia Online
            const slug = livro.n.toLowerCase().replace(/ /g, "-");
            document.getElementById('link-leitura').href = `https://www.bibliaonline.com.br/acf/${slug}/${inicio}`;
            break;
        }
        acumulado += livro.c;
    }

    // Atualização da UI
    document.getElementById('trecho-biblico').innerText = leituraHoje;
    document.getElementById('data-atual').innerText = agora.toLocaleDateString('pt-PT', {day:'numeric', month:'long'});
    
    const progresso = (diaDoAno / 365) * 100;
    document.getElementById('barra-concluida').style.width = progresso + "%";
    document.getElementById('porcentagem-ano').innerText = Math.round(progresso) + "% do ano concluído";
});

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
        document.getElementById(containerId).innerHTML = `<div class="texto-formatado">${texto}</div>`;
    } catch (error) {
        document.getElementById(containerId).innerHTML = "<p>Erro ao carregar o estudo. Tente novamente.</p>";
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}