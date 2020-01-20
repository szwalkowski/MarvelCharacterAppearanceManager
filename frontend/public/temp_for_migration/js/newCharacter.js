window.newCharacter = {};
(function (obj) {
    obj.initTemplate = initTemplate;
    let $uploadCharacterButton, $confirmCharacterButton;
    let $aliasTextInput, $urlCharacterInput;
    let $errorLabel;
    let $characterInfoTableForConfirmation;
    let $realNameTr, $aliasTr, $universeTr, $appearancesTr, $minorAppearancesTr, $imageTr;
    let currentCharacterInfo;

    function initTemplate() {
        $uploadCharacterButton = $('#upload-character-button');
        $uploadCharacterButton.click(uploadCharacter);
        $uploadCharacterButton = $('#confirm-character-button');
        $uploadCharacterButton.click(confirmCharacter);
        $urlCharacterInput = $('#url-character-input');
        $aliasTextInput = $('#alias-text-input');
        $errorLabel = $('#error-label');
        $characterInfoTableForConfirmation = $('#character-info-table-for-confirmation');
        $characterInfoTableForConfirmation.attr('hidden', true);
        $realNameTr = $('#real-name-tr');
        $aliasTr = $('#alias-tr');
        $universeTr = $('#universe-tr');
        $appearancesTr = $('#appearances-tr');
        $minorAppearancesTr = $('#minor-appearances-tr');
        $imageTr = $('#image-tr');
    }

    function uploadCharacter() {
        if (validateForm()) {
            $.ajax({
                type: "POST",
                url: "/newCharacter",
                data: {
                    characterUrl: $urlCharacterInput.val(),
                    customAlias: $aliasTextInput.val()
                },
                async: false,
                success: (responseData) => {
                    currentCharacterInfo = JSON.parse(responseData);
                    fillTableWithCharacterInfo();
                    $characterInfoTableForConfirmation.attr('hidden', false);
                },
                error: (error) => {
                    $characterInfoTableForConfirmation.attr('hidden', true);
                    $errorLabel.text(error.responseText);
                }
            });
        }
    }

    function confirmCharacter() {
        if (validateForm()) {
            $.ajax({
                type: "POST",
                url: "/confirmCharacter",
                data: {currentCharacterInfo},
                async: false,
                success: (responseData) => {
                    $characterInfoTableForConfirmation.attr('hidden', true);
                    loadCharacters();
                    $errorLabel.text("");
                },
                error: (error) => {
                    $errorLabel.text(error.responseText);
                }
            });
        }
    }

    function fillTableWithCharacterInfo() {
        $realNameTr.text(currentCharacterInfo.RealName);
        $aliasTr.text(currentCharacterInfo.SetAlias);
        $universeTr.text(currentCharacterInfo.Universe);
        $appearancesTr.text(currentCharacterInfo.AppearanceCount);
        $minorAppearancesTr.text(currentCharacterInfo.MinorAppearanceCount);
        $imageTr.text(currentCharacterInfo.ImageUrl);
    }

    function validateForm() {
        if ($urlCharacterInput.val().trim() !== "") {
            $errorLabel.text("");
            return true;
        }
        $errorLabel.text(`${$urlCharacterInput.attr("name")} is required!`);
    }

})(window.newCharacter);