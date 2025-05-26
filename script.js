let currentLang = localStorage.getItem("lang") || "en";

const translations = {
  en: {
    title: "GCP Associate Cloud Engineer",
    subtitle: "Select a mode to begin:",
    studyMode: "Study Mode",
    practiceMode: "Practice Mode",
    selectAmount: "How many questions do you want to practice?",
    back: "← Back",
    question: "Question",
    next: "Next →",
    previous: "← Previous",
    summaryTitle: "Session Summary",
    correct: "✔️ Correct",
    incorrect: "❌ Incorrect",
    toMenu: "Back to Menu",
    review: "Review Answers",
    mustAnswer: "You must answer this question before continuing.",
    toMenuInline: "← Back to Menu",
  },
  es: {
    title: "GCP Associate Cloud Engineer",
    subtitle: "Selecciona un modo para comenzar:",
    studyMode: "Modo Estudio",
    practiceMode: "Modo Práctica",
    selectAmount: "¿Cuántas preguntas quieres practicar?",
    back: "← Volver",
    question: "Pregunta",
    next: "Siguiente →",
    previous: "← Anterior",
    summaryTitle: "Resumen del intento",
    correct: "✔️ Correctas",
    incorrect: "❌ Incorrectas",
    toMenu: "Volver al menú",
    review: "Revisar respuestas",
    mustAnswer: "Debes responder esta pregunta antes de continuar.",
    toMenuInline: "← Volver al menú",
  }
};

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  const t = translations[lang];
  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("modo-estudio").textContent = t.studyMode;
  document.getElementById("modo-practica").textContent = t.practiceMode;
  document.getElementById("select-amount-title").textContent = t.selectAmount;
  document.getElementById("volver-inicio").textContent = t.back;
  document.getElementById("anterior").textContent = t.previous;
  document.getElementById("siguiente").textContent = t.next;

  if (modo === "practica" && enRevision) {
    mostrarPregunta(); // actualizar etiquetas durante revision
  }
}


let preguntas = [];
let indiceActual = 0;
let modo = "estudio";
let respuestasUsuario = [];
let enRevision = false;

const contenedor = document.getElementById('pregunta-container');
const anteriorBtn = document.getElementById('anterior');
const siguienteBtn = document.getElementById('siguiente');
const inicio = document.getElementById("inicio");
const selectorPractica = document.getElementById("selector-practica");
const mainApp = document.getElementById("main-app");

document.getElementById("modo-estudio").addEventListener("click", () => {
  modo = "estudio";
  inicio.classList.add("oculto");
  mainApp.classList.remove("oculto");
  cargarPreguntas();
});

document.getElementById("modo-practica").addEventListener("click", () => {
  inicio.classList.add("oculto");
  selectorPractica.classList.remove("oculto");
});

document.getElementById("volver-inicio").addEventListener("click", () => {
  selectorPractica.classList.add("oculto");
  inicio.classList.remove("oculto");
});

document.querySelectorAll(".cantidad-practica").forEach(btn => {
  btn.addEventListener("click", () => {
    const cantidad = parseInt(btn.dataset.cantidad);
    modo = "practica";
    selectorPractica.classList.add("oculto");
    mainApp.classList.remove("oculto");
    cargarPreguntasAleatorias(cantidad);
  });
});

anteriorBtn.addEventListener('click', () => {
  if (indiceActual > 0) {
    indiceActual--;
    mostrarPregunta();
  }
});

siguienteBtn.addEventListener('click', () => {
  if (indiceActual < preguntas.length - 1) {
    indiceActual++;
    mostrarPregunta();
  } else if (enRevision) {
    mostrarResumen();
  }
});

function volverAlMenu() {
  location.reload();
}

function cargarPreguntas() {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      preguntas = data;
      indiceActual = 0;
      mostrarPregunta();
    });
}

function cargarPreguntasAleatorias(cantidad) {
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      preguntas = mezclarArray(data).slice(0, cantidad);
      indiceActual = 0;
      respuestasUsuario = new Array(cantidad).fill(null);
      mostrarPregunta();
    });
}

function mezclarArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function mostrarPregunta() {
  const pregunta = preguntas[indiceActual];
  const opciones = pregunta.options;
  const respuesta = respuestasUsuario[indiceActual];

  contenedor.innerHTML = `
    <div class="pregunta">
      <div class="pregunta-header">
        <h2>${translations[currentLang].question} ${indiceActual + 1} / ${preguntas.length}</h2>
        <button class="btn-volver-inline" onclick="volverAlMenu()">${translations[currentLang].toMenuInline}</button>
      </div>
      <p>${pregunta.text}</p>
      <div class="opciones">
        ${opciones.map((opt) => {
          let clases = "";
          let disabled = false;

          if (modo === "practica" || enRevision) {
            if (respuesta) {
              if (opt.id === respuesta.correcta) clases += " correcta";
              if (opt.id === respuesta.seleccionada && !respuesta.esCorrecta) clases += " incorrecta";
              if (opt.id === respuesta.seleccionada) clases += " seleccionada";
              disabled = true;
            }
          }

          return `<button ${disabled ? "disabled" : ""} onclick="verificarRespuesta(${indiceActual}, '${opt.id}', this)" data-id="${opt.id}" class="${clases.trim()}">
            ${opt.id}) ${opt.text}
          </button>`;
        }).join("")}
      </div>
    </div>
  `;
}

function verificarRespuesta(index, opcionId, boton) {
  const correcta = preguntas[index].options.find(opt => opt.isCorrect).id;

  // En modo práctica: solo permite responder una vez
  if (modo === "practica" && respuestasUsuario[index]) return;

  // En modo estudio: borra memoria previa al responder de nuevo
  if (modo === "estudio") {
    respuestasUsuario[index] = null;
  }

  const botones = document.querySelectorAll(".opciones button");
  botones.forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.id === correcta) {
      btn.classList.add("correcta");
    } else if (btn.dataset.id === opcionId) {
      btn.classList.add("incorrecta");
    }
    if (btn.dataset.id === opcionId) {
      btn.classList.add("seleccionada");
    }
  });

  if (modo === "practica") {
    respuestasUsuario[index] = {
      seleccionada: opcionId,
      correcta: correcta,
      esCorrecta: opcionId === correcta
    };
  
    // Mostrar resumen solo cuando TODAS hayan sido respondidas
    const todasRespondidas = respuestasUsuario.every(r => r !== null);
    if (todasRespondidas) {
      setTimeout(mostrarResumen, 400);
    }
  }
}

function mostrarResumen() {
  const correctas = respuestasUsuario.filter(r => r && r.esCorrecta).length;
  const total = respuestasUsuario.length;

  contenedor.innerHTML = `
    <div class="resumen">
      <h2>${translations[currentLang].summaryTitle}</h2>
      <p>${translations[currentLang].correct}: ${correctas}</p>
      <p>${translations[currentLang].incorrect}: ${total - correctas}</p>
      <button onclick="reiniciar()">${translations[currentLang].toMenu}</button>
      <button onclick="verRevisar()">${translations[currentLang].review}</button>
    </div>
  `;

  document.getElementById("navegacion").style.display = "none";
  enRevision = false;
}

function reiniciar() {
  location.reload();
}

function verRevisar() {
  indiceActual = 0;
  enRevision = true;
  document.getElementById("navegacion").style.display = "flex";
  mostrarPregunta();
}

document.querySelectorAll('#language-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
  
  setLanguage(currentLang); // inicializar idioma al cargar
  