const $characterListDiv = $('.character-list-options-buttons');
let charactersData;

loadCharacters();

function loadCharacters() {
    $.ajax({
        type: "GET",
        url: "/getAllCharacters",
        async: true,
        success: (responseData) => {
            $characterListDiv.empty();
            charactersData = JSON.parse(responseData);
            charactersData.forEach(character => {
                $characterListDiv.append(`<button id="${character.alias}" type="button">${character.alias.replace('_', ' ')}</button><br/>`);
                $(`#${character.alias}`).click((btn) => {
                    const universes = charactersData.find(character => character.alias === btn.target.id).universes;
                });
            });
        },
        error: (error) => {
            console.error(error);
        }
    });
}