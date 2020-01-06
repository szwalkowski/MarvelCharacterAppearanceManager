let visibleFocusTypes = ["Featured Character", "Antagonist", "Supporting Character", "Other Character"];
let appearancesTypes = [];
let rowsWithIssues;
let visibleIssues;

function launchScriptsForIssues() {
    loadRowsWithIssues();
    prepareIssueAppearanceTypeButtons();
    prepareIssueFocusTypeButtons();
    fillAppearancesTypes();
    filterIssues();
}

function loadRowsWithIssues() {
    rowsWithIssues = [];
    for (const row of $('.issue-row')) {
        const focuses = row["dataset"]["focusType"].split(',');
        const appearanceTypes = row["dataset"]["appearanceType"].split(',');
        const read = row["dataset"]["read"];
        rowsWithIssues.push({focuses, appearanceTypes, read, $row: $(row)});
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

function fillAppearancesTypes() {
    for (const appearanceElement of $('.checkbox-for-appearance-type')) {
        appearancesTypes.push(appearanceElement.labels[0].outerText);
    }
}

function filterIssues() {
    visibleIssues = 0;
    rowsWithIssues.forEach(row => {
        if (row.focuses.some(focus => visibleFocusTypes.includes(focus))) {
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


