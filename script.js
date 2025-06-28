const form = document.getElementById("form");
const contadores = document.getElementById("contadores");
const busca = document.getElementById("busca");
const ordenacao = document.getElementById("ordenar");

function salvarContadores(lista) {
  localStorage.setItem("contadores", JSON.stringify(lista));
}

function carregarContadores() {
  return JSON.parse(localStorage.getItem("contadores")) || [];
}

function calcularDias(data) {
  const hoje = new Date();
  const inicio = new Date(data);
  const diff = hoje - inicio;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function renderizarContadores(filtro = "", ordem = "mais_recente") {
  contadores.innerHTML = "";
  let lista = carregarContadores();

  // Filtro por busca
  if (filtro) {
    lista = lista.filter((item) =>
      item.titulo.toLowerCase().includes(filtro.toLowerCase())
    );
  }

  // Ordenação
  lista.sort((a, b) => {
    const dataA = new Date(a.data);
    const dataB = new Date(b.data);
    return ordem === "mais_antigo" ? dataA - dataB : dataB - dataA;
  });

  if (lista.length === 0) {
    contadores.innerHTML = "<p>Nenhum contador encontrado.</p>";
    return;
  }

  lista.forEach((item, index) => {
    const dias = calcularDias(item.data);
    contadores.innerHTML += `
      <div class="contador">
        <div>
          <h2>${item.emoji} ${item.titulo}</h2>
          <p>${dias} ${dias === 1 ? "dia" : "dias"}</p>
          <small>Desde ${new Date(item.data).toLocaleDateString(
            "pt-BR"
          )}</small>
        </div>
        <div class="botoes">
          <button onclick="editar(${index})">Editar</button>
          <button onclick="removerPorDados('${item.titulo}', '${item.data}', '${
      item.emoji
    }')">Remover</button>
        </div>
      </div>
    `;
  });
}

function removerPorDados(titulo, data, emoji) {
  if (!confirm("Tem certeza que deseja remover este contador?")) return;
  let lista = carregarContadores();

  // Encontra e remove o contador exato
  lista = lista.filter(
    (item) =>
      !(item.titulo === titulo && item.data === data && item.emoji === emoji)
  );

  salvarContadores(lista);
  renderizarContadores(busca.value, ordenacao.value);
}

function editar(index) {
  const lista = carregarContadores();
  const item = lista[index];

  const novoTitulo = prompt("Novo título:", item.titulo);
  if (novoTitulo === null) return;

  const novaData = prompt("Nova data (aaaa-mm-dd):", item.data);
  if (novaData === null) return;

  const novoEmoji = prompt("Novo emoji:", item.emoji);
  if (novoEmoji === null) return;

  lista[index] = {
    titulo: novoTitulo.trim() || item.titulo,
    data: novaData || item.data,
    emoji: novoEmoji.trim() || item.emoji,
  };

  salvarContadores(lista);
  renderizarContadores(busca.value, ordenacao.value);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value.trim();
  const data = document.getElementById("data").value;
  const emoji = document.getElementById("emoji").value;

  if (!titulo || !data) {
    alert("Preencha todos os campos!");
    return;
  }

  const lista = carregarContadores();
  lista.push({ titulo, data, emoji });
  salvarContadores(lista);
  form.reset();
  renderizarContadores(busca.value, ordenacao.value);
});

busca.addEventListener("input", () => {
  renderizarContadores(busca.value, ordenacao.value);
});

ordenacao.addEventListener("change", () => {
  renderizarContadores(busca.value, ordenacao.value);
});

renderizarContadores();

const MARCOS = [7, 30, 100, 365];

function solicitarPermissaoNotificacao() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function notificarMarco(titulo, dias) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`🎉 Você atingiu ${dias} dias em "${titulo}"!`);
  }
}

function verificarMarcos() {
  const lista = carregarContadores();
  const notificados = JSON.parse(localStorage.getItem("notificados") || "{}");

  lista.forEach((item, index) => {
    const dias = calcularDias(item.data);

    if (MARCOS.includes(dias)) {
      const chave = `${item.titulo}-${item.data}-${dias}`;
      if (!notificados[chave]) {
        notificarMarco(item.titulo, dias);
        notificados[chave] = true;
      }
    }
  });

  localStorage.setItem("notificados", JSON.stringify(notificados));
}

// Solicita permissão assim que carregar
solicitarPermissaoNotificacao();

// Verifica os marcos após renderizar
renderizarContadores();
verificarMarcos();
