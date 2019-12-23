window.newCharacter = {};

(function (obj) {
    obj.initTemplate = initTemplate;
    let $uploadCharacterButton;
    let $aliasTextInput, $urlCharacterInput;
    let $errorLabel;

    function initTemplate() {
        $uploadCharacterButton = $('#upload-character-button');
        $uploadCharacterButton.click(uploadCharacter);
        $aliasTextInput = $('#url-character-input');
        $urlCharacterInput = $('#alias-text-input');
        $errorLabel = $('#error-label');
    }
    
    function uploadCharacter() {
        if (validateForm()) {

        }
    }

    function validateForm() {
        let errorMessage = "";
        errorMessage += getNameIfEmpty($aliasTextInput);
        errorMessage += getNameIfEmpty($urlCharacterInput);
        if(errorMessage === "") {
            $errorLabel.text("");
            return true;
        }
        $errorLabel.text(`${errorMessage}required!`);
    }

    function getNameIfEmpty(inputTextField){
        if (inputTextField.val().trim() === ""){
            return `${inputTextField.attr("name")}, `;
        }
        return "";
    }

})(window.newCharacter);