// 4, 5 VE 6 HARFLİ GENİŞLETİLMİŞ TÜRKÇE KELİME HAVUZU
const words = [
    // 4 Harfliler
    "MASA", "KUTU", "ROTA", "ALTI", "SORU", "KURS", "GİZEM", "YAZI", "KALE", "OTEL", 
    "SÜRE", "DOST", "MODA", "UMUT", "PLAN", "KRAL", "RÜYA", "ÜLKE", "ŞANS", "BANT",
    // 5 Harfliler
    "KALEM", "KİTAP", "SABAH", "BOMBA", "KODLA", "SÜREK", "YAZIM", "GÜNEŞ", "DENİZ",
    "AKŞAM", "ARABA", "BAHÇE", "BÜYÜK", "CÜMLE", "DOĞRU", "DÜNYA", "EMRAH", "ERKEN",
    "HABER", "HAFTA", "IRMAK", "INSAN", "KABUL", "KAHVE", "LAZIM", "MEYVE", "NOKTA",
    "ORMAN", "ÖRNEK", "PAZAR", "RESİM", "SABIR", "ŞARKI", "TARİH", "UYGUN", "VÜCUT",
    "YAKIN", "ZAMAN", "KÜÇÜK", "YALAN", "SEVGİ", "SÖZLÜ", "DOLAR", "BİLİM", "YARIN",
    // 6 Harfliler
    "MANTIK", "GEÇMİŞ", "TÜRKÇE", "YAZILM", "BOMBAZ", "SİSTEM", "KLAVYE", "EKRAN", 
    "YAZICI", "BEYAZS", "VOLKAN", "ŞELALE", "SULTAN", "MİMARS", "DOKTOR", "KAFKAS"
];

let targetWord = "";
let score = 0;
let timeLeft = 90; 
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

// KONFETİ PATLATMA FONKSİYONU 🎉
function launchConfetti() {
    const colors = ['#00ff66', '#ffcc00', '#ff0055', '#00e5ff', '#ff00ff'];
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = Math.random() * 8 + 5 + 'px';
        confetti.style.height = Math.random() * 15 + 8 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-5vh';
        confetti.style.borderRadius = '2px';
        confetti.style.zIndex = '9999';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        
        document.body.appendChild(confetti);

        const animation = confetti.animate([
            { transform: `translate3d(0, 0, 0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${Math.random() * 100 - 50}px, 105vh, 0) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 1500,
            easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)'
        });

        animation.onfinish = () => confetti.remove();
    }
}

function initGame() {
    targetWord = words[Math.floor(Math.random() * words.length)];
    timeLeft = 90; 
    score = 0;
    scoreDisplay.innerText = score;
    wordInput.disabled = false;
    wordInput.value = "";
    
    updatePlaceholder();
    message.innerHTML = `Bomba aktif! Kelimeyi bul ve dünyayı kurtar!<br><b>İpucu: Kelime ${targetWord.length} harfli!</b><br><br><small>🟢 Yeşil: Doğru yer | 🟡 Sarı: Yanlış yer | ⚫ Gri: Kelimede yok</small>`;
    speak(`Bomba aktif! Aradığın kelime ${targetWord.length} harfli.`);
    
    createGrid();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function updatePlaceholder() {
    wordInput.setAttribute("placeholder", `${targetWord.length} harfli kelime yaz...`);
}

function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < targetWord.length; i++) {
        let box = document.createElement("div");
        box.classList.add("letter-box");
        box.id = "box-" + i;
        grid.appendChild(box);
    }
}

function updateTimer() {
    timeLeft--;
    timerDisplay.innerText = timeLeft;
    if (timeLeft <= 15) { 
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
        let guess = wordInput.value.toLocaleUpperCase('tr-TR');
        if (guess.length !== targetWord.length) {
            message.innerText = `Hey! Aradığımız kelime tam ${targetWord.length} harfli.`;
            speak(`Kelime ${targetWord.length} harfli olmalı`);
            return;
        }
        checkGuess(guess);
        wordInput.value = "";
    }
});

function checkGuess(guess) {
    let correctCount = 0;
    for (let i = 0; i < targetWord.length; i++) {
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

    if (correctCount === targetWord.length) {
        score += 100;
        timeLeft += 20; 
        scoreDisplay.innerText = score;
        message.innerText = "BOOMsuz Günler! Bombayı çözdün. Yeni kelimeye geçiliyor...";
        speak("Harika, bombayı çözdün!");
        
        launchConfetti(); // 🎉 Konfeti burada patlıyor
        
        setTimeout(() => {
            targetWord = words[Math.floor(Math.random() * words.length)];
            updatePlaceholder();
            createGrid();
            message.innerHTML = `Bomba aktif!<br><b>İpucu: Kelime ${targetWord.length} harfli!</b><br><br><small>🟢 Yeşil: Doğru yer | 🟡 Sarı: Yanlış yer | ⚫ Gri: Kelimede yok</small>`;
        }, 1500);
    } else {
        timeLeft -= 3; 
        timerDisplay.innerText = timeLeft;
        let randomJoke = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        
        message.innerHTML = `${randomJoke}<br><b>İpucu: Kelime ${targetWord.length} harfli!</b><br><br><small>🟢 Yeşil: Doğru yer | 🟡 Sarı: Yanlış yer | ⚫ Gri: Kelimede yok</small> `;
        speak(randomJoke);
        
        grid.classList.add("shake");
        setTimeout(() => grid.classList.remove("shake"), 500);
    }
}

function gameOver() {
    wordInput.disabled = true;
    playExplosionSound();
    
    message.innerHTML = `BOOM! 💥 Havaya uçtun! <br> <b>Doğru Kelime: ${targetWord}</b> <br> Skorun: ${score} <br> <button onclick="initGame()">Yeniden Başla</button>`;
    speak(`Güm! Bomba patladı, havaya uçtun! Doğru kelime, ${targetWord} idi.`);
}

createGrid();
message.innerText = "Oyunu başlatmak için ekranda BOŞ BİR YERE TIKLA!";

window.addEventListener("click", () => {
    if (targetWord === "") {
        initGame();
    }
}, { once: true });