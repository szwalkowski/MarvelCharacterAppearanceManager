$landingContainer = $('#landing-container');
$newCharacterButton = $('#add-new-character-button');

$newCharacterButton.click(function () {
    cleanPage();
    provideTemplate.get('newCharacterTemplate', (template) => {
        $landingContainer.html(template());
        postLoadTemplateAction(window.newCharacter);
    });
});

function postLoadTemplateAction(currentController) {
    window.currentController = currentController;
    window.currentController.initTemplate();
}

function cleanPage() {
    $landingContainer.empty();
}