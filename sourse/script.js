// Declaración de variables
var imagenes = ["a.jfif", "b.jfif", "c.jfif", "d.jfif", "e.jfif", "f.jfif", "g.jfif", "h.jfif", "i.jfif"];
var imagenesGemelas = [...imagenes, ...imagenes];
var primeraCarta = null;
var segundaCarta = null;
var bloquearInteraccion = false;
var contadorErrores = 0;
var tiempo = 0;
var intervaloTiempo = null;
var parejasCompletadas = 0;
var mejorTiempo = "99:59";
// Declaración de audios
var audios = {
    music: new Audio("./sourse/audio/music.mp3"),
    volteo: new Audio("./sourse/audio/volteo.mp3"),
    pareja: new Audio("./sourse/audio/pareja.mp3"),
    win: new Audio("./sourse/audio/win.mp3"),
    error: new Audio("./sourse/audio/error.mp3")
};
audios.music.loop = true;
audios.music.volume = 0.3;

$(document).ready(function() {
    generarCartas();
    $("#closeBtn").click(iniciarJuego);
    $("#restart").click(reiniciarJuego);
});

function asignarOrdenAleatorio() {
    var indices = Array.from({length: imagenesGemelas.length}, (_, i) => i).sort(() => Math.random() - 0.5);
    $(".card").each(function(index) { $(this).css("order", indices[index]) });
}

// Función para generar cartas
function generarCartas() {
    var container = $("#container");
    container.empty();  // Limpiar el contenedor
    $.each(imagenesGemelas, function(index, imagen) {
        var carta = $("<div>").addClass("card");
        var img = $("<img>").attr("src", `./sourse/image/${imagen}`);
        var back = $("<div>").addClass("back");
        var span = $("<span>").css("background", "url('./sourse/image/BgCard.svg') center / contain no-repeat");
        back.append(span);
        carta.append(img).append(back);
        carta.click(function() {
            if (!$(this).hasClass("flipped") && !bloquearInteraccion) {
                voltearCarta($(this));
                audios.volteo.currentTime = 0;
                audios.volteo.play();
            }
        });
        container.append(carta);
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
    carta.addClass("flipped");
}

// Función para verificar cartas
function verificarCartas() {
    var imgPrimera = primeraCarta.find("img").attr("src");
    var imgSegunda = segundaCarta.find("img").attr("src");
    if (imgPrimera === imgSegunda) {
        primeraCarta.off("click", voltearCarta);
        segundaCarta.off("click", voltearCarta);
        reiniciarSeleccion();
        parejasCompletadas++;
        if (parejasCompletadas === imagenes.length) {
            clearInterval(intervaloTiempo);
            audios.win.play();
            actualizarMejorTiempo();
            tiempo = 0;
            parejasCompletadas = 0;
        } else {
            setTimeout(function() { audios.pareja.play(); }, 1000);
        }
    } else {
        contadorErrores++;
        actualizarContadorErrores();
        setTimeout(function() {
            audios.error.play();
            primeraCarta.removeClass("flipped");
            segundaCarta.removeClass("flipped");
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
    $("#tiempo").text("00:00");
    clearInterval(intervaloTiempo);
    intervaloTiempo = setInterval(function() {
        tiempo++;
        var minutos = String(Math.floor(tiempo / 60)).padStart(2, '0');
        var segundos = String(tiempo % 60).padStart(2, '0');
        $("#tiempo").text(`${minutos}:${segundos}`);
        verificaLimite();
    }, 1000);
}

function verificaLimite(){
    if (tiempo >= 120) {
        clearInterval(intervaloTiempo);
        actualizarMejorTiempo();
        audios.music.pause();
        $(".card").off("click");
        tiempo = 0;
        parejasCompletadas = 0;
    }
}

// Función para actualizar contador de errores
function actualizarContadorErrores() {
    $("#errores").text(`💔 ${contadorErrores}`);
    if (contadorErrores >= 20) {
        alert("¡Son demasiados intentos!");
    }
}

// Función para actualizar mejor tiempo
function actualizarMejorTiempo() {
    var tiempoActual = $("#tiempo").text();
    if (tiempoActual < mejorTiempo) {
        mejorTiempo = tiempoActual;
        $("#mejorTiempo").text(mejorTiempo);
    }
}

// Función para iniciar juego
function iniciarJuego() {
    $('.overlay').remove();
    generarCartas();
    iniciarTemporizador();
    audios.music.play();
}

// Función para reiniciar juego
function reiniciarJuego() {
    contadorErrores = 0;
    actualizarContadorErrores();
    $("#tiempo").text("00:00");
    tiempo = 0;
    iniciarTemporizador();
    $(".card").removeClass("flipped").on("click", function() {
        if (!$(this).hasClass("flipped") && !bloquearInteraccion) {
            voltearCarta($(this));
            audios.volteo.currentTime = 0;
            audios.volteo.play();
        }
    });
    setTimeout(() => asignarOrdenAleatorio(),1000);
    audios.music.play();
}
// Diseños
$(document).click(e=>{const onda=$('<div>').css({top: e.clientY+'px',left: e.clientX+'px'}).addClass('click').appendTo('body');onda.on('animationend',()=>onda.remove())});
$(document).on('contextmenu mousedown', e => e.preventDefault());
$('#btnScreen').click(() => {$('#btnScreen').text(!document.fullscreenElement ? '💔' : '💖');(!document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen())});