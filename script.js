// GENİŞ TÜRKÇE 5 HARFLİ KELİME HAVUZU
const words = [
    "KALEM", "KİTAP", "MASA", "SABAH", "BOMBA", "KODLA", "SÜREK", "YAZIM", "GÜNEŞ", "DENİZ",
    "AKŞAM", "ARABA", "BAHÇE", "BÜYÜK", "CÜMLE", "DOĞRU", "DÜNYA", "EMRAH", "ERKEN", "FARKLI",
    "GEÇMİŞ", "GÜZEL", "HABER", "HAFTA", "IRMAK", "INSAN", "KABUL", "KAHVE", "LAZIM", "MEYVE",
    "NOKTA", "ORMAN", "ÖRNEK", "PAZAR", "RESİM", "SABIR", "ŞARKI", "TARİH", "UYGUN", "VÜCUT",
    "YAKIN", "ZAMAN", "GİZEM", "KÜÇÜK", "YALAN", "MANTIK", "SEVGİ", "SÖZLÜ", "DOLAR", "BİLİM"
];

let targetWord = "";
let score = 0;
let timeLeft = 45;
let timerInterval;

const funnyMessages = [
    "Patlamaya hazır mısın şampiyon? Bu o kelime değil!",
    "Bomba tıkır tıkır sayıyor, sen hala fantezi peşindesin...",
    "Klavyene kedi mi bastı? Kelime yanlış!",
    "Yanlış! Kabloyu yanlış kestin, süre gitti!",
    "Einstein bile şu an terliyor, biraz daha odaklan!",
    "Kelime dağarcığın bu kadar mı? Başka kelime dene!",
    "İmha ekibi şokta! Lütfen rastgele sallama."
];

const grid = document.getElementById("grid");
const wordInput = document.getElementById("word-input");
const timerDisplay = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const message = document.getElementById("message");
const timerContainer = document.getElementById("timer-container");

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.2;
        window.speechSynthesis.speak(utterance);
    }
}

function playExplosionSound() {
    if (!window.AudioContext) return;
    let ctx = new AudioContext();
    let osc = ctx.createOscillator();
    let gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1.5);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
}

function initGame() {
    targetWord = words[Math.floor(Math.random() * words.length)];
    timeLeft = 45;
    score = 0;
    scoreDisplay.innerText = score;
    wordInput.disabled = false;
    wordInput.value = "";
    
    // BAŞLANGIÇTA RENK KILAVUZUNU EKRANA YAZIYORUZ
    message.innerHTML = "Bomba aktif! Kelimeyi bul ve dünyayı kurtar!<br><br><small>🟢 Yeşil: Doğru yer | 🟡 Sarı: Kelimede var ama yanlış yer | ⚫ Gri: Kelimede yok</small>";
    speak("Bomba aktif! Kelimeyi bul ve dünyayı kurtar!");
    
    createGrid();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < 5; i++) {
        let box = document.createElement("div");
        box.classList.add("letter-box");
        box.id = "box-" + i;
        grid.appendChild(box);
    }
}

function updateTimer() {
    timeLeft--;
    timerDisplay.innerText = timeLeft;
    if (timeLeft <= 10) {
        timerContainer.classList.add("danger");
    } else {
        timerContainer.classList.remove("danger");
    }
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver();
    }
}

wordInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        let guess = wordInput.value.toUpperCase();
        if (guess.length !== 5) {
            message.innerText = "Hey! Kelime dediğin 5 harfli olur.";
            speak("Kelime 5 harfli olmalı");
            return;
        }
        checkGuess(guess);
        wordInput.value = "";
    }
});

function checkGuess(guess) {
    let correctCount = 0;
    for (let i = 0; i < 5; i++) {
        let box = document.getElementById("box-" + i);
        let letter = guess[i];
        box.innerText = letter;

        if (targetWord[i] === letter) {
            box.className = "letter-box correct";
            correctCount++;
        } else if (targetWord.includes(letter)) {
            box.className = "letter-box present";
        } else {
            box.className = "letter-box absent";
        }
    }

    if (correctCount === 5) {
        score += 100;
        timeLeft += 15;
        scoreDisplay.innerText = score;
        message.innerText = "BOOMsuz Günler! Bombayı çözdün. Yeni kelimeye geçiliyor...";
        speak("Harika, bombayı çözdün!");
        setTimeout(() => {
            targetWord = words[Math.floor(Math.random() * words.length)];
            createGrid();
            message.innerHTML = "Bomba aktif!<br><br><small>🟢 Yeşil: Doğru yer | 🟡 Sarı: Yanlış yer | ⚫ Gri: Kelimede yok</small>";
        }, 1500);
    } else {
        timeLeft -= 5;
        timerDisplay.innerText = timeLeft;
        let randomJoke = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        
        // HATA YAPINCA RENK KILAVUZUNU ALTTA TUTMAYA DEVAM EDİYORUZ
        message.innerHTML = `${randomJoke}<br><br><small>🟢 Yeşil: Doğru yer | 🟡 Sarı: Yanlış yer | ⚫ Gri: Kelimede yok</small> `;
        speak(randomJoke);
        
        grid.classList.add("shake");
        setTimeout(() => grid.classList.remove("shake"), 500);
    }
}

function gameOver() {
    wordInput.disabled = true;
    playExplosionSound();
    
    // OYUN BİTTİĞİNDE DOĞRU KELİMEYİ EKRANDA GÖSTERİYORUZ
    message.innerHTML = `BOOM! 💥 Havaya uçtun! <br> <b>Doğru Kelime: ${targetWord}</b> <br> Skorun: ${score} <br> <button onclick="initGame()">Yeniden Başla</button>`;
    
    // DOĞRU KELİMEYİ SESLİ SÖYLÜYORUZ
    speak(`Güm! Bomba patladı, havaya uçtun! Doğru kelime, ${targetWord} idi.`);
}

// İlk açılışta boş kutuları çiziyoruz
createGrid();
message.innerText = "Oyunu başlatmak için ekranda BOŞ BİR YERE TIKLA!";

window.addEventListener("click", () => {
    if (targetWord === "") {
        initGame();
    }
}, { once: true });