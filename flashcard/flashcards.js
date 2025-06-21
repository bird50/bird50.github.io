let cards = [];
let index = 0;
let correct = 0;

function start() {
    const deck = document.getElementById("deck").value;
    const mode = document.querySelector('input[name="mode"]:checked').value;

    fetch(`data/${deck}`)
        .then(res => res.json())
        .then(data => {
            cards = data;
            if (mode === "random") {
                cards.sort(() => Math.random() - 0.5);
            }
            index = 0;
            correct = 0;
            document.getElementById("card-section").classList.remove("hidden");
            document.getElementById("finish-button").classList.remove("hidden");
            showCard();
        });
}

function showCard() {
    if (index >= cards.length) {
        finishQuiz();
        return;
    }

    const card = cards[index];
    document.getElementById("flashcard").innerHTML = `คำถาม: ${card.question}`;
    document.getElementById("answer").innerHTML = "";
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("score").innerHTML = `ข้อที่ ${index + 1} จาก ${cards.length}`;
}

function showAnswer() {
    const card = cards[index];
    document.getElementById("answer").innerHTML = `คำตอบ: ${card.answer}`;
}

function markCorrect() {
    correct++;
    nextCard();
}

function nextCard() {
    index++;
    showCard();
}

function finishQuiz() {
    document.getElementById("flashcard").innerHTML = "<h2 class='text-center text-2xl text-blue-600'>จบการ์ดแล้ว!</h2>";
    document.getElementById("answer").innerHTML = "";
    document.getElementById("buttons").style.display = "none";
    document.getElementById("finish-button").classList.add("hidden");
    document.getElementById("score").innerHTML =
        `คุณตอบถูก ${correct} จาก ${cards.length} ข้อ (${Math.round(correct / cards.length * 100)}%)`;
}

document.addEventListener("DOMContentLoaded", function () {
    fetch("data/index.json")
        .then(res => res.json())
        .then(decks => {
            const select = document.getElementById("deck");
            decks.forEach(deck => {
                const option = document.createElement("option");
                option.value = deck.file;
                option.textContent = deck.name;
                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("โหลดรายชื่อไฟล์ไม่สำเร็จ", err);
        });
});