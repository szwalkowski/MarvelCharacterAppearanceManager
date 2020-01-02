const $characterListDiv = $('.character-list-options-buttons');
const $universeListDiv = $('.universe-list-options-buttons');
let pickedCharacterAlias;
let charactersData;

loadCharacters();

function loadCharacters() {
    $.ajax({
        type: "GET",
        url: "/getAllCharacters",
        async: true,
        success: (responseData) => {
            $characterListDiv.empty();
            $universeListDiv.empty();
            charactersData = JSON.parse(responseData);
            charactersData.forEach(character => {
                $characterListDiv.append(`<button id="${character.alias}" type="button">${character.alias.replace('_', ' ')}</button><br/>`);
                $(`#${character.alias}`).click((btn) => {
                    $universeListDiv.empty();
                    pickedCharacterAlias = btn.target.id;
                    showCharacterUniverses();
                });
            });
        },
        error: (error) => {
            console.error(error);
        }
    });
}
function showCharacterUniverses() {
    const universes = charactersData.find(character => character.alias === pickedCharacterAlias).universes;
    universes.forEach(universe => {
        $universeListDiv.append(`<button id="${universe}" type="button">${universe}</button><br/>`);
    });
}