window.newCharacter = {};
(function (obj) {
    obj.initTemplate = initTemplate;
    let $uploadCharacterButton;
    let $aliasTextInput, $urlCharacterInput;
    let $errorLabel;
    let $characterInfoTableForConfirmation;
    let $realNameTr, $aliasTr, $universeTr, $appearancesTr, $minorAppearancesTr, $imageTr;
    let currentCharacterInfo;

    function initTemplate() {
        $uploadCharacterButton = $('#upload-character-button');
        $uploadCharacterButton.click(uploadCharacter);
        $urlCharacterInput = $('#url-character-input');
        $aliasTextInput = $('#alias-text-input');
        $errorLabel = $('#error-label');
        $characterInfoTableForConfirmation = $('#characterInfoTableForConfirmation');
        $characterInfoTableForConfirmation.attr('hidden', true);
        $realNameTr = $('#realNameTr');
        $aliasTr = $('#aliasTr');
        $universeTr = $('#universeTr');
        $appearancesTr = $('#appearancesTr');
        $minorAppearancesTr = $('#minorAppearancesTr');
        $imageTr = $('#imageTr');
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