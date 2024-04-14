document.addEventListener("DOMContentLoaded", function () {
    document.onmousedown = e => e.preventDefault();
    const container = document.getElementById("container");
    const images = ["a.jfif", "b.jfif", "c.jfif", "d.jfif", "e.jfif", "f.jfif", "g.jfif", "h.jfif", "i.jfif"];
    const flipSound = new Audio("./sourse/audio/flip.mp3");
    const parejaSound = new Audio("./sourse/audio/1.mp3");
    const errorSound = new Audio("./sourse/audio/huh.mp3");
    const winSound = new Audio("./sourse/audio/2.mp3");
    const music = new Audio("./sourse/audio/bs.mp3");

    music.loop = true;
    music.volume = 0.4;

    const tiempo = document.getElementById("tiempo");
    const bestTime = document.getElementById("mejorTiempo");
    let mejorTiempo = Infinity;
    let time = 0;
    let temporizador;

    tiempo.textContent = "00:00";
    bestTime.textContent = "00:00";

    function temporizer(action) {
        clearInterval(temporizador);
        if (action === "stop") return;
        if (action === "reset") time = -1;
        temporizador = setInterval(updateTimer, 1000);
    }

    function updateTimer() {
        time++;
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        tiempo.textContent = `${pad(minutes)}:${pad(seconds)}`;
        if (time >= 600) {
            clearInterval(temporizador);
            if (time < mejorTiempo) {
                mejorTiempo = time;
                bestTime.textContent = `${pad(minutes)}:${pad(seconds)}`;
            }
        }
    }

    function pad(number) { return (number < 10 ? '0' : '') + number; }

    const overlay = document.querySelector('.overlay');
    const closeBtn = document.getElementById('closeBtn');

    closeBtn.addEventListener('click', function () {
        music.play();
        overlay.style.display = 'none';
        temporizer();
    });

    const restartBtn = document.getElementById('restart');
    restartBtn.addEventListener('click', restartGame);

    function restartGame() {
        container.addEventListener('transitionend', handleTransitionEnd);
        cards.forEach(card => card.classList.remove("flipped"));
        temporizer("reset");
    }

    function handleTransitionEnd() {
        const isTransitioning = cards.some(card => card.classList.contains('flipped'));
        if (!isTransitioning) {
            container.removeEventListener('transitionend', handleTransitionEnd);
            resetGame();
        }
    }

    function resetGame() {
        temporizer("reset");
        matchedPairs = errores = 0;
        document.getElementById("Errores").innerText = `Errores: ${errores}`;
        flippedCards = [];
        clickEnabled = true;
        cards.forEach(card => card.addEventListener("click", flipCard));
        shuffleCards(cards);
    }

    const cards = createCards(images);
    addCardsToContainer(container, cards);
    addClickEventToCards(cards, flipCard);

    let flippedCards = [];
    let matchedPairs = 0;
    let clickEnabled = true;
    let errores = 0;

    function createCards(images) {
        const imagesCopy = [...images, ...images];
        return imagesCopy.map(img => createCardElement(img));
    }

    function createCardElement(imgSrc) {
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

    function addCardsToContainer(container, cards) { cards.forEach(card => container.appendChild(card)); }

    function addClickEventToCards(cards, handler) { cards.forEach(card => card.addEventListener("click", handler)); }

    function flipCard() {
        if (!clickEnabled || this.classList.contains("flipped") || flippedCards.length === 2) return;
        flipSound.pause();
        flipSound.currentTime = 0;
        flipSound.play();
        this.classList.add("flipped");
        flippedCards.push(this);
        if (flippedCards.length === 2) { clickEnabled = false; setTimeout(checkMatch, 1000); }
    }

    function checkMatch() {
        const [firstCardImg, secondCardImg] = flippedCards.map(card => card.querySelector("img").src);
        if (firstCardImg === secondCardImg) {
            flippedCards.forEach(card => card.removeEventListener("click", flipCard));
            matchedPairs++;
            parejaSound.play();
            if (matchedPairs === images.length) {
                parejaSound.pause();
                winSound.play();
                temporizer("stop");
                if (time < mejorTiempo) { mejorTiempo = time; bestTime.textContent = tiempo.textContent; }
                alert("¡Felicidades! Has completado el juego.");
            }
        } else {
            flippedCards.forEach(card => card.classList.remove("flipped"));
            errores++;
            errorSound.play();
            document.getElementById("Errores").innerText = `Errores: ${errores}`;
        }
        flippedCards = [];
        clickEnabled = true;
    }
    shuffleCards(cards);
});

function shuffleCards(cards) {
    cards.forEach(card => {
        const randomPos = Math.floor(Math.random() * cards.length);
        card.style.order = randomPos;
    });
}

document.addEventListener('click', e => {
    const d = document.createElement("div");
    d.className = "click";
    d.style.top = e.clientY + "px";
    d.style.left = e.clientX + "px";
    document.body.appendChild(d);
    d.addEventListener('animationend', () => d.remove());
});