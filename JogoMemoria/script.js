let cards = [];
let flippedCards = [];
let matchedCards = [];
let timer;
let timeLeft = 60;
let score = 0;
let playerName = '';
let difficulty = 'easy';

const startButton = document.getElementById('start-btn');
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const playerNameInput = document.getElementById('player-name');
const gameInfo = document.getElementById('game-info');
const playerInfo = document.getElementById('player-info');
const difficultySelect = document.getElementById('difficulty');
const rankingTable = document.querySelector('#ranking tbody');
const rankingSection = document.getElementById('ranking');
const clearRankingButton = document.getElementById('clear-ranking-btn');

const imageUrls = [
    './imagem/carta1.png',
    './imagem/carta2.png',
    './imagem/carta3.png',
    './imagem/carta4.png',
    './imagem/carta5.png',
    './imagem/carta6.png',
    './imagem/carta7.png',
    './imagem/carta8.png'
];

difficultySelect.addEventListener('change', (e) => difficulty = e.target.value);

function shuffleCards(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function startGame() {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Por favor, insira seu nome!');
        return;
    }

    if (!/^[a-zA-Z\s]+$/.test(playerName)) {
        alert('O nome deve conter apenas letras e espaços!');
        return;
    }

    let numPairs;
    switch (difficulty) {
        case 'easy':
            numPairs = 4;
            timeLeft = 60;
            gameBoard.style.gridTemplateColumns = 'repeat(4, 120px)';
            break;
        case 'medium':
            numPairs = 6;
            timeLeft = 45;
            gameBoard.style.gridTemplateColumns = 'repeat(4, 120px)';
            break;
        case 'hard':
            numPairs = 8;
            timeLeft = 30;
            gameBoard.style.gridTemplateColumns = 'repeat(4, 120px)';
            break;
    }

    cards = shuffleCards([...imageUrls.slice(0, numPairs), ...imageUrls.slice(0, numPairs)]);

    gameBoard.innerHTML = '';
    matchedCards = [];
    flippedCards = [];
    score = 0;
    scoreDisplay.textContent = `Pontuação: ${score}`;

    cards.forEach((card) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.card = card;
        cardElement.style.backgroundImage = "url('imagem/cartaTraseira.png')";
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });

    gameInfo.classList.remove('hidden');
    playerInfo.classList.add('hidden');
    rankingSection.classList.add('hidden');
    startTimer();
}

function flipCard(event) {
    const clickedCard = event.target;

    if (flippedCards.length === 2 || clickedCard.classList.contains('flipped') || matchedCards.includes(clickedCard)) {
        return;
    }

    clickedCard.classList.add('flipped');
    clickedCard.style.backgroundImage = `url('${clickedCard.dataset.card}')`;

    flippedCards.push(clickedCard);

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.card === card2.dataset.card) {
        matchedCards.push(card1, card2);

        card1.classList.add('matched');
        card2.classList.add('matched');

        score += 10;
        scoreDisplay.textContent = `Pontuação: ${score}`;
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.style.backgroundImage = "url('imagem/cartaTraseira.png')";
            card2.style.backgroundImage = "url('imagem/cartaTraseira.png')";
        }, 600);
    }

    flippedCards = [];
    checkGameOver();
}

function checkGameOver() {
    if (matchedCards.length === cards.length || timeLeft === 0) {
        clearInterval(timer);
        if (matchedCards.length === cards.length) {
            alert('Parabéns! Você venceu!');
        } else {
            alert('Tempo esgotado! Você perdeu!');
        }
        updateRanking(playerName, score, 60 - timeLeft);  // Registra no ranking
        resetGame();
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Tempo: ${timeLeft}s`;

        if (timeLeft === 10) {
            timerDisplay.classList.add('warning');
        }

        if (timeLeft === 0) {
            clearInterval(timer);
            alert('Tempo esgotado! Você perdeu!');
            resetGame();
        }
    }, 1000);
}

function updateRanking(playerName, score, timeTaken) {
    const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
    rankings.push({ player: playerName, score, timeTaken });
    rankings.sort((a, b) => a.timeTaken - b.timeTaken || b.score - a.score);
    localStorage.setItem('rankings', JSON.stringify(rankings));
    displayRanking();
}

function displayRanking() {
    const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
    rankingTable.innerHTML = rankings.map((entry, index) => 
        `<tr>
            <td>${index + 1}</td>
            <td>${entry.player}</td>
            <td>${entry.score}</td>
            <td>${entry.timeTaken}s</td>
        </tr>`
    ).join('');
    rankingSection.classList.remove('hidden');
}

function resetGame() {
    timeLeft = 60;
    gameBoard.innerHTML = '';
    gameInfo.classList.add('hidden');
    playerInfo.classList.remove('hidden');
}

// Limpar ranking
clearRankingButton.addEventListener('click', () => {
    if (confirm('Tem certeza de que deseja limpar o ranking?')) {
        localStorage.removeItem('rankings');
        displayRanking();
    }
});

startButton.addEventListener('click', startGame);

displayRanking();
