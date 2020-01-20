window.appearanceTypeDictionary = {};
(function (obj) {
    obj.initTemplate = initTemplate;
    let $dictionaryBody;
    let $errorLabel;
    let dictionaryContent;

    function initTemplate() {
        $dictionaryBody = $('#dictionary-body');
        $errorLabel = $('#error-label');
        getDictionary();
        $('#save-dictionary-button').click(saveDictionary);
    }

    function getDictionary() {
        $.ajax({
            type: "GET",
            url: "/getDictionary",
            data: `dictionaryId=appearanceType`,
            async: true,
            success: (responseData) => {
                dictionaryContent = JSON.parse(responseData);
                fillDictionary();
            },
            error: (error) => {
                console.error(error);
            }
        });
    }

    function saveDictionary() {
        $.ajax({
            type: "POST",
            url: "/saveDictionary",
            data: {dictionaryId: "appearanceType", dictionaryContent},
            async: false,
            success: (responseData) => {
                alert("AWESOME");
                $errorLabel.text("");
            },
            error: (error) => {
                $errorLabel.text(error.responseText);
            }
        })
    }

    function fillDictionary() {
        $dictionaryBody.empty();
        provideTemplate.get('dictionaryRowTemplate', (template) => {
            $dictionaryBody.html(template(dictionaryContent));
            addEventsToButtons();
        });
    }

    function addEventsToButtons() {
        $('.remove-dictionary-record').click(btn => {
            dictionaryContent = dictionaryContent.filter(row => row.label !== btn.target.value);
            fillDictionary();
        });
        $('.remove-value-under-label').click(btn => {
            dictionaryContent.forEach(record => {
                record.values = record.values.filter(value => value !== btn.target.value);
            });
            fillDictionary();
        });
        $('#new-dictionary-record-button').click(tryToAddNewLabel);
        $('.add-value-under-label').click(btn => {
            const newValue = $(`.new-value-under-label-${btn.target.value.replace(/ /g, "_")}`).val().trim();
            const targetRecord = dictionaryContent.find(record => record.label === btn.target.value);
            let valid = true;
            dictionaryContent.forEach(record => {
                const foundValue = record.values.find(value => value === newValue);
                if (foundValue) {
                    valid = false;
                    alert(`${newValue} is defined already as value in ${record.label} label!`);
                }
            });
            if (valid) {
                targetRecord.values.push(newValue);
                fillDictionary();
            }
        });
    }

    function tryToAddNewLabel() {
        const newLabel = $('#dictionary-label-new-record-text').val().trim();
        const newValue = $('#dictionary-value-new-record-text').val().trim().toUpperCase();
        let valid = true;
        if (!newLabel) {
            alert(`Define label`);
            return;
        } else if (!newValue) {
            alert(`Define value`);
            return;
        } else if (newLabel.indexOf('_') > -1 || newLabel.indexOf(',') > -1) {
            alert(`Label can't contain underscore '_' nor comma ','`);
            return;
        } else if (newLabel.toUpperCase() === 'EMPTY') {
            alert(`Use -hide- instead of empty`);
            return;
        }
        dictionaryContent.forEach(record => {
            if (record.label === newLabel) {
                valid = false;
                alert(`${newLabel} is defined already!`);
                return;
            }
            const foundValue = record.values.find(value => value === newValue);
            if (foundValue) {
                valid = false;
                alert(`${newValue} is defined already as value in ${record.label} label!`);
            }
        });
        if (valid) {
            dictionaryContent.push({
                label: newLabel,
                values: [newValue]
            });
            fillDictionary();
        }
    }

})(window.appearanceTypeDictionary);