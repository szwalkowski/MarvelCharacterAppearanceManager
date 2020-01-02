$landingContainer = $('#landing-container');
$newCharacterButton = $('#add-new-character-button');

$newCharacterButton.click(function () {
    cleanPage();
    provideTemplate.get('newCharacterTemplate', (template) => {
        $landingContainer.html(template());
        postLoadTemplateAction(window.newCharacter);
    });
});

function loadIssuesListTemplate(characterData) {
    cleanPage();
    provideTemplate.get('issuesTemplate', (template) => {
        $landingContainer.html(template(characterData));
    });
}

function postLoadTemplateAction(currentController) {
    window.currentController = currentController;
    window.currentController.initTemplate();
}

function cleanPage() {
    $landingContainer.empty();
}