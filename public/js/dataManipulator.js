const $characterListDiv = $('.character-list-options-buttons');
const $universeListDiv = $('.universe-list-options-buttons');

loadCharacters();

function loadCharacters() {
    $.ajax({
        type: "GET",
        url: "/getAllCharacters",
        async: true,
        success: (responseData) => {
            $characterListDiv.empty();
            $universeListDiv.empty();
            JSON.parse(responseData).forEach(character => {
                $characterListDiv.append(`<button id="${character.alias}_button" type="button">${character.alias.replace('_', ' ')}</button><br/>`);
                $(`#${character.alias}_button`).click(() => {
                    $universeListDiv.empty();
                    showCharacterUniverses(character);
                });
            });
        },
        error: (error) => {
            console.error(error);
        }
    });
}

function showCharacterUniverses(character) {
    character.universes.forEach(universe => {
        $universeListDiv.append(`<button id="${character.alias}_${universe}_button" type="button">${universe}</button><br/>`);
        $(`#${character.alias}_${universe}_button`).click((btn) => {
            getAllIssuesForCharacter(character.alias, universe);
        });
    });
}

function getAllIssuesForCharacter(alias, universe) {
    $.ajax({
        type: "GET",
        url: "/getAllIssuesForCharacter",
        data: `alias=${alias}&universe=${universe}`,
        async: true,
        success: (responseData) => {
            const characterData = JSON.parse(responseData);
            loadIssuesListTemplate(characterData);
            console.log(characterData);
        },
        error: (error) => {
            console.error(error);
        }
    });
}