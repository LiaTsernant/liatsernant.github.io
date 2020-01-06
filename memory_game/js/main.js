let cards = [
    {
        rank: "queen",
        suit: "hearts",
        cardImage: "images/queen-of-hearts.png"
    },

    {
        rank: "queen",
        suit: "diamonds",
        cardImage: "images/queen-of-diamonds.png"
    },

    {
        rank: "king",
        suit: "hearts",
        cardImage: "images/king-of-hearts.png"
    },

    {
        rank: "king",
        suit: "diamonds",
        cardImage: "images/king-of-diamonds.png"
    }
];
let cardsInPlay = [];

function checkForMatch() {
    if (cardsInPlay[0] === cardsInPlay[1]) {
        alert("You found a match!");
      } else {
        alert("Sorry, try again.");
      }
};

function flipCard() {
    let cardId = this.getAttribute('cardIndex');
    cardsInPlay.push(cards[cardId].rank);

    this.setAttribute('src', cards[cardId].cardImage);
    if (cardsInPlay.length === 2) {
      checkForMatch();
    };
};

function createBoard() {
    for (let i = 0; i < cards.length; i += 1) {
        let cardElement = document.createElement("img");
        
        cardElement.setAttribute('cardIndex', i);
        cardElement.className += " cardImage";
        cardElement.addEventListener('click', flipCard);
        document.getElementById('game-board').appendChild(cardElement);
    };

    resetButtonClicked();
};

function resetButtonClicked() {
    cardsInPlay = [];
    let allCards = document.querySelectorAll('.cardImage');
    for (let i = 0; i < allCards.length; i += 1) {
        let card = allCards[i];
        card.setAttribute('src', "images/back.png");
    };
};

createBoard();

