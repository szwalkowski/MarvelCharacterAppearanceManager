$landingContainer = $('#landing-container');
$newCharacterButton = $('#add-new-character-button');

$newCharacterButton.click(function () {
    cleanPage();
    cleanActiveCharacterButtons();
    provideTemplate.get('newCharacterTemplate', (template) => {
        $landingContainer.html(template());
        postLoadTemplateAction(window.newCharacter);
    });
});

function loadIssuesListTemplate(characterDataAndAppearancesTypes) {
    cleanPage();
    provideTemplate.get('issuesTemplate', (template) => {
        $landingContainer.html(template(characterDataAndAppearancesTypes));
    });
}

function postLoadTemplateAction(currentController) {
    window.currentController = currentController;
    window.currentController.initTemplate();
}

function cleanPage() {
    $landingContainer.empty();
}