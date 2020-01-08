let $readStatusDropdown;
let visibleFocusTypes = ["Featured Character", "Antagonist", "Supporting Character", "Other Character"];
let appearancesTypes = [];
let rowsWithIssues;
let visibleIssues;

function launchScriptsForIssues() {
    $readStatusDropdown = $('#read-status-dropdown');
    $readStatusDropdown.change(filterIssues);
    loadRowsWithIssues();
    prepareIssueAppearanceTypeButtons();
    prepareIssueFocusTypeButtons();
    prepareReadButtons();
    fillAppearancesTypes();
    filterIssues();
}

function loadRowsWithIssues() {
    rowsWithIssues = [];
    for (const row of $('.issue-row')) {
        const focuses = row["dataset"]["focusType"].split(',');
        const appearanceTypes = row["dataset"]["appearanceType"].split(',');
        const read = row["dataset"]["read"];
        const issueId = row["dataset"]["issueId"];
        rowsWithIssues.push({issueId, focuses, appearanceTypes, read, $row: $(row)});
        visibleIssues++;
    }
}

function prepareIssueAppearanceTypeButtons() {
    $('.checkbox-for-appearance-type').change(checkbox => {
        if ($(checkbox.currentTarget).prop("checked")) {
            appearancesTypes.push(checkbox.target.labels[0].outerText);
        } else {
            appearancesTypes = appearancesTypes.filter(type => type !== checkbox.target.labels[0].outerText);
        }
        filterIssues();
    });
}

function prepareIssueFocusTypeButtons() {
    $('#feature-character-check').change(checkbox => {
        modifyFocusTypesArray("Featured Character", $(checkbox.currentTarget).prop("checked"));
        filterIssues();
    });
    $('#antagonist-check').change(checkbox => {
        modifyFocusTypesArray("Antagonist", $(checkbox.currentTarget).prop("checked"));
        filterIssues();
    });
    $('#supporting-character-check').change(checkbox => {
        modifyFocusTypesArray("Supporting Character", $(checkbox.currentTarget).prop("checked"));
        filterIssues();
    });
    $('#other-character-check').change(checkbox => {
        modifyFocusTypesArray("Other Character", $(checkbox.currentTarget).prop("checked"));
        filterIssues();
    });
}

function modifyFocusTypesArray(focusTypeName, add) {
    if (add) {
        visibleFocusTypes.push(focusTypeName);
    } else {
        visibleFocusTypes = visibleFocusTypes.filter(focus => focus !== focusTypeName);
    }
}

function prepareReadButtons() {
    $('.read-issue-button').click(btn => {
        $.ajax({
            type: "POST",
            url: "/markIssueAsRead",
            async: false,
            data: {
                issueId: btn.target.value,
                characterAlias: $('.selectedCharacter')[0].innerText,
                characterUniverse: $('.selectedUniverse')[0].innerText
            },
            success: (responseData) => {
                const responseDataAsObject = JSON.parse(responseData);
                const rowWithIssue = rowsWithIssues.find(row => row.issueId === responseDataAsObject.issueId);
                const $label = rowWithIssue.$row.find('.read-time-label');
                $label.text(formatTime(new Date(responseDataAsObject.readTime)));
                $label.attr("hidden", false);
                rowWithIssue.$row.find('.remove-read-issue-button').attr("hidden", false);
                rowWithIssue.$row.find('.read-issue-button').attr("hidden", true);
                rowWithIssue.read = true;
                filterIssues();
            },
            error: (error) => {
                console.error(error);
            }
        });
    });
    $('.remove-read-issue-button').click(btn => {
        $.ajax({
            type: "POST",
            url: "/unmarkIssueAsRead",
            async: false,
            data: {
                issueId: btn.target.value,
                characterAlias: $('.selectedCharacter')[0].innerText,
                characterUniverse: $('.selectedUniverse')[0].innerText
            },
            success: (responseData) => {
                const rowWithIssue = rowsWithIssues.find(row => row.issueId === JSON.parse(responseData).issueId);
                rowWithIssue.$row.find('.read-time-label').attr("hidden", true);
                rowWithIssue.$row.find('.remove-read-issue-button').attr("hidden", true);
                rowWithIssue.$row.find('.read-issue-button').attr("hidden", false);
                rowWithIssue.read = false;
                filterIssues();
            },
            error: (error) => {
                console.error(error);
            }
        });
    });
}

function fillAppearancesTypes() {
    for (const appearanceElement of $('.checkbox-for-appearance-type')) {
        appearancesTypes.push(appearanceElement.labels[0].outerText);
    }
}

function filterIssues() {
    visibleIssues = 0;
    rowsWithIssues.forEach(row => {
        if (($readStatusDropdown.val() === '1' && row.read) || ($readStatusDropdown.val() === '2' && !row.read)) {
            row.$row.attr('hidden', true);
        } else if (row.focuses.some(focus => visibleFocusTypes.includes(focus))) {
            row.$row.attr('hidden', false);
            visibleIssues++;
        } else {
            if (row.appearanceTypes.some(type => appearancesTypes.includes(type) || (!type && appearancesTypes.includes("Empty")))) {
                row.$row.attr('hidden', false);
                visibleIssues++;
            } else {
                row.$row.attr('hidden', true);
            }
        }
    });
}


