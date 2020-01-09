let cards = [
    {
        rank: "paris",
        display: false,
        cardImage: "images/paris.png",
        id: 1
    },

    {
        rank: "paris",
        display: false,
        cardImage: "images/paris.png",
        id: 2
    },

    {
        rank: "london",
        display: false,
        cardImage: "images/london.png",
        id: 3
    },

    {
        rank: "london",
        display: false,
        cardImage: "images/london.png",
        id: 4
    },

    {
        rank: "new_york",
        display: false,
        cardImage: "images/new_york.png",
        id: 5
    },

    {
        rank: "new_york",
        display: false,
        cardImage: "images/new_york.png",
        id: 6
    }
];

let shuffledCards = shuffle(cards);
let cardsInPlay = [];

//Start the game
function game() {
    createNewBoard();
    foundMatches = 0;
}

//Create HTML images
function createNewBoard() {
    for (let i = 0; i < shuffledCards.length; i += 1) {
        let cardElement = document.createElement("img");
        cardElement.setAttribute('cardIndex', i);
        cardElement.className += "cardImage";
        cardElement.addEventListener('click', showCard);
        document.getElementById('game-board').appendChild(cardElement);
    };

    resetBoard();
};

//Show card face
function showCard() {
    let cardId = this.getAttribute('cardIndex');
    cardsInPlay.push(shuffledCards[cardId]);
    shuffledCards[cardId].seen = true;
    this.setAttribute('src', shuffledCards[cardId].cardImage);
    
    if (cardsInPlay.length === 2) {
        checkForMatch();
    };
}

//Check if 2 cards match
function checkForMatch() {
    if (cardsInPlay[0].id !== cardsInPlay[1].id && 
        cardsInPlay[0].rank === cardsInPlay[1].rank) {
            cardsInPlay = [];
    } else if (cardsInPlay[0].id === cardsInPlay[1].id) {
        alert("HA! It's the same card! Try again!");
        resetBoard();
    } else {
        setTimeout(function(){ resetBoard(); }, 700);
    }
}

//Turn away all cards
function resetBoard() {
    cardsInPlay = [];
    let allCards = document.querySelectorAll('.cardImage');
    for (let i = 0; i < allCards.length; i += 1) {
        let card = allCards[i];
        card.setAttribute('src', "images/back.png");
    };
};

//Refresh the game and shuffle
function resetButtonClicked() {
    resetBoard();
    shuffledCards = shuffle(cards);
};

//Shuffle all cards
function shuffle(array) {
	var currentIndex = array.length;
	var temporaryValue, randomIndex;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	};

	return array;
};

game();

