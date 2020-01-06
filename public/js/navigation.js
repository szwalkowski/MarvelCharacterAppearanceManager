$landingContainer = $('#landing-container');
$newCharacterButton = $('#add-new-character-button');
$appearancesDictionaryButton = $('#appearances-types-dictionary-button');

$newCharacterButton.click(() => {
    cleanPage();
    cleanActiveCharacterButtons();
    provideTemplate.get('newCharacterTemplate', (template) => {
        $landingContainer.html(template());
        postLoadTemplateAction(window.newCharacter);
    });
});

$appearancesDictionaryButton.click(() => {
    cleanPage();
    cleanActiveCharacterButtons();
    provideTemplate.get('appearanceTypeDictionaryTemplate', (template) => {
        $landingContainer.html(template());
        postLoadTemplateAction(window.appearanceTypeDictionary);
    });
});

function loadIssuesListTemplate(characterDataAndAppearancesTypes) {
    cleanPage();
    provideTemplate.get('issuesTemplate', (template) => {
        $landingContainer.html(template(characterDataAndAppearancesTypes));
        launchScriptsForIssues();
    });
}

function postLoadTemplateAction(currentController) {
    window.currentController = currentController;
    window.currentController.initTemplate();
}

function cleanPage() {
    $landingContainer.empty();
}