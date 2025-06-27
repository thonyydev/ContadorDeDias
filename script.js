const form = document.getElementById("form");
const contadores = document.getElementById("contadores");

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

function renderizarContadores() {
  contadores.innerHTML = "";
  const lista = carregarContadores();
  lista.forEach((item, index) => {
    const dias = calcularDias(item.data);
    contadores.innerHTML += `
      <div class="contador">
        <div>
          <h2>${item.emoji} ${item.titulo}</h2>
          <p>${dias} dias</p>
        </div>
        <button onclick="remover(${index})">Remover</button>
      </div>
    `;
  });
}

function remover(index) {
  const lista = carregarContadores();
  lista.splice(index, 1);
  salvarContadores(lista);
  renderizarContadores();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  const emoji = document.getElementById("emoji").value;
  const lista = carregarContadores();
  lista.push({ titulo, data, emoji });
  salvarContadores(lista);
  form.reset();
  renderizarContadores();
});

renderizarContadores();