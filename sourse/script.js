document.addEventListener("DOMContentLoaded", function () {
    document.onmousedown = e => e.preventDefault();
    const contenedor = document.getElementById("container");
    const images = ["a.jfif", "b.jfif", "c.jfif", "d.jfif", "e.jfif", "f.jfif", "g.jfif", "h.jfif", "i.jfif"];
    const flipSound = new Audio("./sourse/audio/flip.mp3");
    const parejaSound = new Audio("./sourse/audio/1.mp3");
    const errorSound = new Audio("./sourse/audio/huh.mp3");
    const winSound = new Audio("./sourse/audio/2.mp3");
    const music = new Audio("./sourse/audio/bs.mp3");
    const cartas = crearCartas(images);
    let cartasVolteadas = [];
    let matchedPairs = 0;
    let clickEnabled = true;
    const tiempo = document.getElementById("tiempo");
    const bestTime = document.getElementById("mejorTiempo");
    let mejorTiempo = 120;
    let time = 0;
    let temporizador;
    const contErrores = document.getElementById("errores");
    let errores = 0;

    music.loop = true;
    music.volume = 0.4;

    function crearCartas(images) {
        const imagesCopy = [...images, ...images];
        return imagesCopy.map(img => creaCarta(img));
    }

    function creaCarta(imgSrc) {
        const div = document.createElement("div");
        div.classList.add("card");
        const img = document.createElement("img");
        img.src = "./sourse/image/" + imgSrc;
        img.alt = "Imagen";
        const div2 = document.createElement("div");
        div2.classList.add("back");
        const span = document.createElement("span");
        span.style.background = `url("./sourse/image/BgCard.svg") center / contain no-repeat`;
        div.appendChild(img);
        div2.appendChild(span);
        div.appendChild(div2);
        return div;
    }

    aggCartasAl(contenedor, cartas);
    aggClickAlas(cartas, voltearCarta);
    function aggCartasAl(contenedor, cartas) { cartas.forEach(carta => contenedor.appendChild(carta)); }
    function aggClickAlas(cartas, handler) { cartas.forEach(carta => carta.addEventListener("click", handler)); }

    function voltearCarta() {
        if (!clickEnabled || this.classList.contains("flipped") || cartasVolteadas.length === 2) return;
        flipSound.pause();
        flipSound.currentTime = 0;
        flipSound.play();
        this.classList.add("flipped");
        cartasVolteadas.push(this);
        if (cartasVolteadas.length === 2) { clickEnabled = false; setTimeout(checkMatch, 1000); }
    }

    function checkMatch() {
        const [primeraCarta, segundaCarta] = cartasVolteadas.map(carta => carta.querySelector("img").src);
        if (primeraCarta === segundaCarta) {
            cartasVolteadas.forEach(carta => carta.removeEventListener("click", voltearCarta));
            matchedPairs++;
            if (matchedPairs === images.length) {
                winSound.play();
                temporizer("stop");
                if (time < mejorTiempo) { mejorTiempo = time; bestTime.textContent = tiempo.textContent; }
                alert("¡Felicidades! Has completado el juego.");
            } else {
                parejaSound.play();
            }
        } else {
            cartasVolteadas.forEach(carta => carta.classList.remove("flipped"));
            errores++;
            errorSound.play();
            contErrores.innerText = `💔 ${errores}`;
        }
        cartasVolteadas = [];
        clickEnabled = true;
    }
    mezclarLas(cartas);

    document.getElementById('restart').addEventListener('click', restartGame);

    function temporizer(toki) {
        clearInterval(temporizador);
        if (toki === "stop") return;
        if (toki === "reset") time = -1;
        temporizador = setInterval(actTiempo, 1000);
    }

    function actTiempo() {
        time++;
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        tiempo.textContent = `${pad(minutes)}:${pad(seconds)}`;
        if (time >= 120) {
            clearInterval(temporizador);
            if (time < mejorTiempo) {
                mejorTiempo = time;
                bestTime.textContent = `${pad(minutes)}:${pad(seconds)}`;
            }
            alert("Se te acabo el tiempo!");
            restartGame();
        }
    }

    function pad(number) { return (number < 10 ? '0' : '') + number; }

    document.getElementById('closeBtn').addEventListener('click', function () {
        music.play();
        document.querySelector('.overlay').style.display = 'none';
        temporizer();
    });

    function restartGame() {
        container.addEventListener('transitionend', verificaVolteo);
        temporizer("reset");
        errores = 0;
        contErrores.innerText = `💔 ${errores}`;
        cartas.forEach(carta => carta.classList.remove("flipped"));
    }

    function verificaVolteo() {
        const isTransitioning = cartas.some(carta => carta.classList.contains('flipped'));
        if (!isTransitioning) {
            container.removeEventListener('transitionend', verificaVolteo);
            resetGame();
        }
    }

    function resetGame() {
        temporizer("reset");
        errores = 0;
        contErrores.innerText = `💔 ${errores}`;
        matchedPairs = 0;
        cartasVolteadas = [];
        clickEnabled = true;
        cartas.forEach(carta => carta.addEventListener("click", voltearCarta));
        mezclarLas(cartas);
    }


    let estado = false;
    const btnScreen = document.getElementById('btnScreen');
    btnScreen.addEventListener('click', () => {
        estado = !estado;
        btnScreen.textContent = estado ? '💔' : '💖';
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    });


});

function mezclarLas(cartas) {
    cartas.forEach(carta => carta.style.order = Math.floor(Math.random() * cartas.length));
}

document.addEventListener('click', e => {
    const onda = document.createElement("div");
    Object.assign(onda.style, {
        top: e.clientY + 'px',
        left: e.clientX + 'px'
    });
    document.body.appendChild(onda);
    onda.classList.add('click');
    onda.addEventListener('animationend', () => onda.remove());
});

document.addEventListener('contextmenu', e => e.preventDefault());