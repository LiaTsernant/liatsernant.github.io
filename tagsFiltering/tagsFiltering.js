function removeDupsTags(str) {
    let arr = str.split(/[; .\t\n]/)
    let result = {};
    let lowLetterWords = [];
    for (let i = 0; i < arr.length; i += 1) {
        let word = arr[i].toLowerCase();
        lowLetterWords.push(word);
    };

    for (let i = 0; i < lowLetterWords.length; i += 1) {
        result[lowLetterWords[i]] = true;
    };

    let unique = Object.keys(result);
    return unique.join(" ");
};

removeDupsTags("Кофе кофе")

function readAndFilterSource() {
    let input = document.getElementById("source").value;
    if (input === "I am fox") {
        console.log("ddd")
        $('#foxModal').modal();
        return
    };
    let filteredTags = removeDupsTags(input);
    document.getElementById("source").value = filteredTags;
};

function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function copySource() {
    readAndFilterSource();
    copyToClipboard(document.getElementById("source").value)
}

function showPopUpMessage() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}