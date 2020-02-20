let gallery = document.querySelector('.gif-gallery');

function setupQueryValue() {
    let currentParams = new URLSearchParams(window.location.search)
    let currentQ = currentParams.get('q');
    if (currentQ === null) {
        currentQ = "cats"
    };
    document.querySelector('.gif-input').setAttribute("value", currentQ);
};
setupQueryValue();

$.ajax({
    method: 'GET',
    url: 'https://api.giphy.com/v1/gifs/search',
    data: $('form').serialize(),
    success: onSuccess,
    error: onError
});

function onSuccess(json) {
    json.data.forEach((imageData) => {
        let img = document.createElement('img');
        img.setAttribute('src', imageData.images.downsized.url);
        gallery.appendChild(img);
    });
};

function onError(xhr, status, errorThrown) {
    alert("Sorry, there was a problem!");
    console.log("Error: " + errorThrown);
    console.log("Status: " + status);
    console.dir(xhr);
};