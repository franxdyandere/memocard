// Declaración de variables
const imagenes = ["a.jfif", "b.jfif", "c.jfif", "d.jfif", "e.jfif", "f.jfif", "g.jfif", "h.jfif", "i.jfif"];
const imagenesGemelas = [...imagenes, ...imagenes];
let primeraCarta = null;
let segundaCarta = null;
let bloquearInteraccion = false;
let contadorErrores = 0;
let tiempo = 0;
let intervaloTiempo = null;
let parejasCompletadas = 0;
let mejorTiempo = "99:59";

// Declaración de audios
const audios = {
    music: new Audio("./source/audio/music.mp3"),
    volteo: new Audio("./source/audio/volteo.mp3"),
    pareja: new Audio("./source/audio/pareja.mp3"),
    win: new Audio("./source/audio/win.mp3"),
    error: new Audio("./source/audio/error.mp3")
};
audios.music.loop = true;
audios.music.volume = 0.3;

// Document ready
document.addEventListener('DOMContentLoaded', () => {
    generarCartas();
    document.getElementById('closeBtn').addEventListener('click', iniciarJuego);
    document.getElementById('restart').addEventListener('click', reiniciarJuego);
});

// Función para asignar orden aleatorio
function asignarOrdenAleatorio() {
    const indices = Array.from({length: imagenesGemelas.length}, (_, i) => i).sort(() => Math.random() - 0.5);
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.order = indices[index];
    });
}

// Función para generar cartas
function generarCartas() {
    const container = document.getElementById('container');
    container.innerHTML = ''; // Limpiar el contenedor
    imagenesGemelas.forEach((imagen, index) => {
        const carta = document.createElement('div');
        carta.classList.add('card');
        
        const img = document.createElement('img');
        img.src = `./source/image/${imagen}`;
        
        const back = document.createElement('div');
        back.classList.add('back');
        
        const span = document.createElement('span');
        span.style.background = "url('./source/image/BgCard.svg') center / contain no-repeat";
        
        back.appendChild(span);
        carta.appendChild(img);
        carta.appendChild(back);
        
        carta.addEventListener('click', () => {
            if (!carta.classList.contains('flipped') && !bloquearInteraccion) {
                voltearCarta(carta);
                audios.volteo.currentTime = 0;
                audios.volteo.play();
            }
        });
        
        container.appendChild(carta);
    });
    asignarOrdenAleatorio();
}

// Función para voltear carta
function voltearCarta(carta) {
    if (!primeraCarta) {
        primeraCarta = carta;
    } else if (!segundaCarta) {
        segundaCarta = carta;
        bloquearInteraccion = true;
        verificarCartas();
    }
    carta.classList.add('flipped');
}

// Función para verificar cartas
function verificarCartas() {
    const imgPrimera = primeraCarta.querySelector('img').src;
    const imgSegunda = segundaCarta.querySelector('img').src;
    if (imgPrimera === imgSegunda) {
        primeraCarta.removeEventListener('click', voltearCarta);
        segundaCarta.removeEventListener('click', voltearCarta);
        reiniciarSeleccion();
        parejasCompletadas++;
        if (parejasCompletadas === imagenes.length) {
            clearInterval(intervaloTiempo);
            audios.win.play();
            actualizarMejorTiempo();
            tiempo = 0;
            parejasCompletadas = 0;
        } else {
            setTimeout(() => { audios.pareja.play(); }, 1000);
        }
    } else {
        contadorErrores++;
        actualizarContadorErrores();
        setTimeout(() => {
            audios.error.play();
            primeraCarta.classList.remove('flipped');
            segundaCarta.classList.remove('flipped');
            reiniciarSeleccion();
        }, 1000);
    }
}

// Función para reiniciar selección
function reiniciarSeleccion() {
    primeraCarta = null;
    segundaCarta = null;
    bloquearInteraccion = false;
}

// Función para iniciar temporizador
function iniciarTemporizador() {
    document.getElementById('tiempo').textContent = "00:00";
    clearInterval(intervaloTiempo);
    intervaloTiempo = setInterval(() => {
        tiempo++;
        const minutos = String(Math.floor(tiempo / 60)).padStart(2, '0');
        const segundos = String(tiempo % 60).padStart(2, '0');
        document.getElementById('tiempo').textContent = `${minutos}:${segundos}`;
        verificaLimite();
    }, 1000);
}

function deshabilitarEventos() {
    document.querySelectorAll('.card').forEach(card => {
        card.replaceWith(card.cloneNode(true)); // Remueve todos los event listeners
    });
}

function verificaLimite() {
    if (tiempo >= 120) {
        clearInterval(intervaloTiempo);
        actualizarMejorTiempo();
        audios.music.pause();
        deshabilitarEventos();
        tiempo = 0;
        parejasCompletadas = 0;
    }
}

// Función para actualizar contador de errores
function actualizarContadorErrores() {
    document.getElementById('errores').textContent = `💔 ${contadorErrores}`;
    if (contadorErrores >= 20) {
        alert("¡Son demasiados intentos!");
    }
}

// Función para actualizar mejor tiempo
function actualizarMejorTiempo() {
    const tiempoActual = document.getElementById('tiempo').textContent;
    if (tiempoActual < mejorTiempo) {
        mejorTiempo = tiempoActual;
        document.getElementById('mejorTiempo').textContent = mejorTiempo;
    }
}

// Función para iniciar juego
function iniciarJuego() {
    document.querySelector('.overlay').remove();
    generarCartas();
    iniciarTemporizador();
    audios.music.play();
}

// Función para reiniciar juego
function reiniciarJuego() {
    contadorErrores = 0;
    actualizarContadorErrores();
    document.getElementById('tiempo').textContent = "00:00";
    tiempo = 0;
    parejasCompletadas = 0;
    iniciarTemporizador();
    document.querySelectorAll('.card').forEach(card => {
        card.classList.remove('flipped');
        card.addEventListener('click', () => {
            if (!card.classList.contains('flipped') && !bloquearInteraccion) {
                voltearCarta(card);
                audios.volteo.currentTime = 0;
                audios.volteo.play();
            }
        });
    });
    setTimeout(() => asignarOrdenAleatorio(), 1000);
    audios.music.play();
}

// Diseños
document.addEventListener('click', (e) => {
    const onda = document.createElement('div');
    onda.style.top = e.clientY + 'px';
    onda.style.left = e.clientX + 'px';
    onda.classList.add('click');
    document.body.appendChild(onda);
    onda.addEventListener('animationend', () => onda.remove());
});
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('mousedown', e => e.preventDefault());
document.getElementById('btnScreen').addEventListener('click', () => {
    const btn = document.getElementById('btnScreen');
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        btn.textContent = '💔';
    } else {
        document.exitFullscreen();
        btn.textContent = '💖';
    }
});