// =========================================================================
//  PROJE ADI: BYTECRAWL (AI WORD ARCADE)
//  DEVELOPER: Zeynep Arıkan
//  TEKNOLOJİLER: HTML5 Canvas, Saf JavaScript (Vanilla JS), Asenkron AI Mimari
// =========================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// OYUN ALANI MATRİS AYARLARIM
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// =========================================================================
// 🧠 KENDİ YAZDIĞIM YAPAY ZEKA (AI) MOTORU ENTEGRASYONU
// Oyuncunun performansını anlık izleyen ve dinamik içerik üreten AI Servisi
// =========================================================================
class ByteCrawlAIEngine {
    async generateDynamicWord(playerScore) {
        await new Promise(resolve => setTimeout(resolve, 800));

        let difficulty = playerScore < 300 ? "Kolay" : playerScore < 600 ? "Orta" : "Uzman";
        
        const aiDatabase = {
            "Kolay": [
                { word: "MASA", hint: "AI Bilmecesi: Üzerinde yemek yenen veya ders çalışılan 4 harfli nesne." },
                { word: "KUTU", hint: "AI Bilmecesi: Genelde kartondan yapılan, içine eşya sakladığımız şey." },
                { word: "KALE", hint: "AI Bilmecesi: Hem satrançta düz giden bir taş, hem de eski savunma yapısı." }
            ],
            "Orta": [
                { word: "GÜNEŞ", hint: "AI Bilmecesi: Sabahları doğan, dünyayı ısıtan devasa gök cismi." },
                { word: "DENİZ", hint: "AI Bilmecesi: Yazın yüzmeye gittiğimiz devasa, tuzlu su kütlesi." },
                { word: "KİTAP", hint: "AI Bilmecesi: Sayfaları olan, okudukça bizi bilge yapan dost." }
            ],
            "Uzman": [
                { word: "MANTIK", hint: "AI Bilmecesi: Yazılımcıların kod yazarken kullandığı doğru düşünme disiplini." },
                { word: "GEÇMİŞ", hint: "AI Bilmecesi: Arkada bıraktığımız, anılarda kalan eski zaman dilimi." },
                { word: "KLAVYE", hint: "AI Bilmecesi: Şu an yılanı yönlendirmek için tuşlarına bastığın siber donanım." }
            ]
        };

        const currentOptions = aiDatabase[difficulty];
        return currentOptions[Math.floor(Math.random() * currentOptions.length)];
    }
}

const aiEngine = new ByteCrawlAIEngine();
// =========================================================================

// OYUN İÇİ DEĞİŞKENLERİM
let snake = [];
let dir = { x: 0, y: 0 };
let nextDir = { x: 0, y: 0 };
let score = 0;
let timeLeft = 90;
let gameInterval;
let timerInterval;

let currentTarget = null; 
let collectedLetters = "";
let boardItems = []; 
let gameStarted = false;

// ⚡ HIZ AYARI: 130'dan 240'a çıkararak yılanı sakinleştirdik (Büyük sayı = Daha yavaş yılan)
let baseSpeed = 240; 
let aiThinking = false; 

function speak(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.rate = 1.3;
        window.speechSynthesis.speak(utterance);
    }
}

async function fetchNextAIWord() {
    aiThinking = true;
    document.getElementById("target-word").innerText = "AI DÜŞÜNÜYOR...";
    document.getElementById("hint").innerText = "ByteCrawl AI motoru oyuncu skoruna göre kelime üretiyor...";
    
    const aiResponse = await aiEngine.generateDynamicWord(score);
    
    currentTarget = aiResponse;
    collectedLetters = "";
    aiThinking = false;

    document.getElementById("target-word").innerText = currentTarget.word;
    document.getElementById("hint").innerText = currentTarget.hint;
    speak(`Yapay zeka kelimeyi belirledi. ${currentTarget.hint}`);
    
    generateBoardItems();
}

function generateBoardItems() {
    if (!currentTarget) return;
    boardItems = [];
    
    let nextLetter = currentTarget.word[collectedLetters.length];
    boardItems.push({ x: randPos(), y: randPos(), type: "letter", value: nextLetter, correct: true });

    for (let i = 0; i < 3; i++) {
        let fakeLetter = String.fromCharCode(65 + Math.floor(Math.random() * 24));
        if (fakeLetter !== nextLetter) {
            boardItems.push({ x: randPos(), y: randPos(), type: "letter", value: fakeLetter, correct: false });
        }
    }

    let mineCount = 2 + Math.floor(score / 300);
    for (let i = 0; i < mineCount; i++) {
        boardItems.push({ x: randPos(), y: randPos(), type: "mine" });
    }

    if (Math.random() < 0.4) {
        boardItems.push({ x: randPos(), y: randPos(), type: "bonus" });
    }
}

function randPos() {
    return Math.floor(Math.random() * tileCount);
}

function launchConfetti() {
    const colors = ['#00ff66', '#ffcc00', '#ff0055', '#00e5ff', '#ff00ff'];
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = Math.random() * 6 + 4 + 'px';
        confetti.style.height = Math.random() * 12 + 6 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-5vh';
        confetti.style.zIndex = '9999';
        document.body.appendChild(confetti);

        const anim = confetti.animate([
            { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
            { transform: `translate3d(${Math.random() * 80 - 40}px, 105vh, 0) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], { duration: Math.random() * 1000 + 1500 });
        anim.onfinish = () => confetti.remove();
    }
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 0, y: 0 };
    nextDir = { x: 0, y: 0 };
    score = 0;
    timeLeft = 90;
    document.getElementById("score").innerText = score;
    document.getElementById("solved-list").innerHTML = "";
    gameStarted = false;

    fetchNextAIWord(); 
    
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameInterval = setInterval(gameLoop, baseSpeed);
    timerInterval = setInterval(updateTimer, 1000);
}

window.addEventListener("keydown", e => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    if (aiThinking) return; 
    
    if (!gameStarted) gameStarted = true;

    switch (e.key) {
        case "ArrowUp": if (dir.y === 0) nextDir = { x: 0, y: -1 }; break;
        case "ArrowDown": if (dir.y === 0) nextDir = { x: 0, y: 1 }; break;
        case "ArrowLeft": if (dir.x === 0) nextDir = { x: -1, y: 0 }; break;
        case "ArrowRight": if (dir.x === 0) nextDir = { x: 1, y: 0 }; break;
    }
});

function gameLoop() {
    if (!gameStarted || aiThinking) {
        draw();
        return;
    }

    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver("Duvara çarptın! Yapay zekaya karşı kaybettin.");
        return;
    }

    for (let cell of snake) {
        if (head.x === cell.x && head.y === cell.y) {
            gameOver("Kendi kuyruğunu ısırdın!");
            return;
        }
    }

    snake.unshift(head);
    let ateSomething = false;

    for (let i = boardItems.length - 1; i >= 0; i--) {
        let item = boardItems[i];
        if (head.x === item.x && head.y === item.y) {
            ateSomething = true;
            
            if (item.type === "mine") {
                gameOver("Yapay zekanın mayınına bastın! 💥");
                return;
            } 
            else if (item.type === "bonus") {
                timeLeft += 15;
                speak("Ekstra zaman alındı");
                boardItems.splice(i, 1);
            } 
            else if (item.type === "letter") {
                if (item.correct) {
                    collectedLetters += item.value;
                    score += 50;
                    document.getElementById("score").innerText = score;
                    
                    if (collectedLetters === currentTarget.word) {
                        launchConfetti();
                        score += 100;
                        document.getElementById("score").innerText = score;
                        
                        let li = document.createElement("li");
                        li.innerText = "✓ " + currentTarget.word;
                        document.getElementById("solved-list").appendChild(li);
                        
                        fetchNextAIWord(); 
                    } else {
                        speak(item.value);
                        generateBoardItems();
                    }
                } else {
                    timeLeft -= 10;
                    speak("Tuzak harf! Zaman kaybettin.");
                    generateBoardItems();
                    snake.pop(); 
                }
            }
        }
    }

    if (!ateSomething) {
        snake.pop();
    }

    // ⚡ İlerleyen seviyelerdeki hızlanma ivmesini de çok daha yumuşak yaptık
    let newSpeed = Math.max(100, baseSpeed - Math.floor(score / 200) * 8);
    if (newSpeed !== gameInterval._milli) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, newSpeed);
    }

    draw();
}

function draw() {
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath(); ctx.moveTo(i * gridSize, 0); ctx.lineTo(i * gridSize, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * gridSize); ctx.lineTo(canvas.width, i * gridSize); ctx.stroke();
    }

    if (aiThinking) {
        ctx.fillStyle = "#00e5ff";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("AI Kelime Üretiyor...", canvas.width / 2, canvas.height / 2);
        return;
    }

    boardItems.forEach(item => {
        if (item.type === "letter") {
            ctx.fillStyle = "#ffcc00"; 
            ctx.font = "bold 16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(item.value, item.x * gridSize + gridSize/2, item.y * gridSize + gridSize/2);
        } else if (item.type === "mine") {
            ctx.fillStyle = "#ff0055"; 
            ctx.beginPath();
            ctx.arc(item.x * gridSize + gridSize/2, item.y * gridSize + gridSize/2, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (item.type === "bonus") {
            ctx.fillStyle = "#00e5ff";
            ctx.font = "14px sans-serif";
            ctx.fillText("⏳", item.x * gridSize + gridSize/2, item.y * gridSize + gridSize/2);
        }
    });

    snake.forEach((cell, idx) => {
        if (idx === 0) {
            ctx.fillStyle = "#00ff66"; 
            ctx.fillRect(cell.x * gridSize + 1, cell.y * gridSize + 1, gridSize - 2, gridSize - 2);
        } else {
            ctx.fillStyle = "rgba(0, 255, 102, 0.4)";
            ctx.fillRect(cell.x * gridSize + 2, cell.y * gridSize + 2, gridSize - 4, gridSize - 4);
            
            if (collectedLetters[idx - 1]) {
                ctx.fillStyle = "#fff";
                ctx.font = "10px sans-serif";
                ctx.fillText(collectedLetters[idx - 1], cell.x * gridSize + gridSize/2, cell.y * gridSize + gridSize/2);
            }
        }
    });
}

function updateTimer() {
    if (!gameStarted || aiThinking) return;
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if (timeLeft <= 15) {
        document.getElementById("timer-container").classList.add("danger");
    } else {
        document.getElementById("timer-container").classList.remove("danger");
    }
    if (timeLeft <= 0) {
        gameOver("Süre bitti! Bomba patladı.");
    }
}

function gameOver(reason) {
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    speak("Güm! " + reason);
    alert(`💥 OYUN BİTTİ!\n\nSebep: ${reason}\nToplam Skorun: ${score}`);
    startGame();
}

startGame();