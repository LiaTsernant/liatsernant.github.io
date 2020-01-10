let cardCollection = [
    {
        rank: "paris",
        cardImage: "images/paris.png",
        id: 1
    },
    {
        rank: "paris",
        cardImage: "images/paris.png",
        id: 2
    },
    {
        rank: "london",
        cardImage: "images/london.png",
        id: 3
    },
    {
        rank: "london",
        cardImage: "images/london.png",
        id: 4
    },
    {
        rank: "new_york",
        cardImage: "images/new_york.png",
        id: 5
    },
    {
        rank: "new_york",
        cardImage: "images/new_york.png",
        id: 6
    },
    {
        rank: "japan",
        cardImage: "images/japan.png",
        id: 7
    },
    {
        rank: "japan",
        cardImage: "images/japan.png",
        id: 8
    },
    {
        rank: "amsterdam",
        cardImage: "images/amsterdam.png",
        id: 9
    },
    {
        rank: "amsterdam",
        cardImage: "images/amsterdam.png",
        id: 10
    },
    {
        rank: "italy",
        cardImage: "images/italy.png",
        id: 11
    },
    {
        rank: "italy",
        cardImage: "images/italy.png",
        id: 12
    }
];
let cards = [];

//Sets the length of cards array according to level
function createGameSize(length) {
    resetBoard();
    cards = [];
    for (let i = 0; i < length; i += 1) {
        let card = cardCollection[i];
        cards.push(card);
    }
    cards = shuffle(cards);

    resetBoard();
};

let cardsInPlay = [];

//Starts game and creates a board default size = 6
function createDefaultBoard() {
    createGameSize(6);
};

//Show card face
function showCard() {
    let cardId = this.getAttribute('cardIndex');
    cardsInPlay.push(cards[cardId]);
    this.setAttribute('src', cards[cardId].cardImage);

    if (cardsInPlay.length === 2) {
        checkForMatch();
    };
};

//Check if 2 cards match
function checkForMatch() {
    if (cardsInPlay[0].id !== cardsInPlay[1].id &&
        cardsInPlay[0].rank === cardsInPlay[1].rank) {
        cardsInPlay = [];
    } else if (cardsInPlay[0].id === cardsInPlay[1].id) {
        alert("HA! It's the same card! Try again!");
        resetBoard();
    } else {
        setTimeout(function () { resetBoard(); }, 700);
    }
};

//Turn away all cards
function resetBoard() {
    cardsInPlay = [];
    let allCards = document.querySelectorAll('.cardImage');
    for (let i = 0; i < allCards.length; i += 1) {
        let card = allCards[i];
        card.parentNode.removeChild(card);
    };

    for (let i = 0; i < cards.length; i += 1) {
        let cardElement = document.createElement("img");
        cardElement.setAttribute('cardIndex', i);
        cardElement.className += "cardImage";
        cardElement.addEventListener('click', showCard);
        document.getElementById('game-board').appendChild(cardElement);
        cardElement.setAttribute('src', "images/back.png")
    };
};

//Refresh the game and shuffle
function resetButtonClicked() {
    resetBoard();
    cards = shuffle(cards);
};

//Shuffle all cards
function shuffle(array) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    };

    return array;
};

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function showDropDown() {
    document.getElementById("myDropdown").classList.toggle("show");
};

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            };
        };
    };
};

createDefaultBoard();

