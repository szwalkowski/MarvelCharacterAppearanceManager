window.newCharacter = {};
(function (obj) {
    obj.initTemplate = initTemplate;
    let $uploadCharacterButton;
    let $aliasTextInput, $urlCharacterInput;
    let $errorLabel;

    function initTemplate() {
        $uploadCharacterButton = $('#upload-character-button');
        $uploadCharacterButton.click(uploadCharacter);
        $urlCharacterInput = $('#url-character-input');
        $aliasTextInput = $('#alias-text-input');
        $errorLabel = $('#error-label');
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
                }
            });
        }
    }

    function validateForm() {
        if ($urlCharacterInput.val().trim() !== "") {
            $errorLabel.text("");
            return true;
        }
        $errorLabel.text(`${$urlCharacterInput.attr("name")} is required!`);
    }

})(window.newCharacter);