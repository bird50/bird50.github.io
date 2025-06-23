let cards = [];
let index = 0;
let correct = 0;
let wrongCards = [];

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
            wrongCards = [];
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
	a='correct';
    nextCard(a);
}

function markWrong() {
	a='wrong';
    nextCard(a);
}

function nextCard(a='correct') {
    const card = cards[index];
    /*if (!document.getElementById("answer").innerHTML) {
        wrongCards.push(card);
    }*/
    if (a=='wrong') {
        wrongCards.push(card);
    }
    index++;
    showCard();
}

function finishQuiz() {
    localStorage.setItem("wrongCards", JSON.stringify(wrongCards));

    document.getElementById("flashcard").innerHTML = "<h2 class='text-center text-2xl text-blue-600'>จบการ์ดแล้ว!</h2>";
    document.getElementById("answer").innerHTML = "";
    document.getElementById("buttons").style.display = "none";
    document.getElementById("finish-button").classList.add("hidden");
    document.getElementById("score").innerHTML =
        `คุณตอบถูก ${correct} จาก ${cards.length} ข้อ (${Math.round(correct / cards.length * 100)}%)`;

   /* if (wrongCards.length > 0) {
        const retryBtn = document.createElement("button");
        retryBtn.textContent = "ฝึกคำที่ตอบผิด";
        retryBtn.className = "w-full bg-red-500 text-white p-2 mt-2 rounded hover:bg-red-600 transition";
        retryBtn.onclick = reviewWrongCards;
        document.getElementById("card-section").appendChild(retryBtn);

        const clearBtn = document.createElement("button");
        clearBtn.textContent = "ล้างคำที่ตอบผิด";
        clearBtn.className = "w-full bg-gray-500 text-white p-2 mt-2 rounded hover:bg-gray-600 transition";
        clearBtn.onclick = clearWrongCards;
        document.getElementById("card-section").appendChild(clearBtn);
    }
	   */
}

function reviewWrongCards() {
    const stored = localStorage.getItem("wrongCards");
    if (stored) {
        cards = JSON.parse(stored);
        index = 0;
        correct = 0;
        wrongCards = [];
        document.getElementById("score").innerHTML = "";
        document.getElementById("buttons").style.display = "flex";
        showCard();
    }
}

function clearWrongCards() {
    localStorage.removeItem("wrongCards");
    alert("ล้างคำที่ตอบผิดเรียบร้อยแล้ว");
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