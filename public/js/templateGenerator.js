const cachedTemplates = {};

const provideTemplate = {
    get: (templateName, callback) => {
        if (cachedTemplates[templateName]) {
            return callback(cachedTemplates[templateName]);
        }
        $.get(`/templates/${templateName}.hbs`, (data) => {
            prepareHelpers();
            cachedTemplates[templateName] = Handlebars.compile(data);
            callback(cachedTemplates[templateName]);
        });
    }
};

function prepareHelpers() {
    timestampToDate();
    helperForSpaceUnderscoreEscaping();
    Handlebars.registerHelper("resolveFocusTypes", function (appearances) {
        const appearancesFocuses = new Set();
        appearances.forEach(appearance => {
            appearancesFocuses.add(appearance.focusType);
        });
        return [...appearancesFocuses];
    });
    Handlebars.registerHelper("resolveAppearanceTypes", function (appearances) {
        const appearancesTypes = new Set();
        appearances.forEach(appearance => {
            appearance.appearanceTypes.forEach(appearanceType => {
                appearancesTypes.add(appearanceType);
            });
        });
        return [...appearancesTypes];
    });
}

function timestampToDate() {
    Handlebars.registerHelper("timestampToDate", function (timestamp) {
        return formatDate(new Date(timestamp));
    });
}

function helperForSpaceUnderscoreEscaping() {
    Handlebars.registerHelper("spacesToUnderscores", function (string) {
        return string.replace(/ /g, "_");
    });
    Handlebars.registerHelper("underscoresToSpaces", function (string) {
        return string.replace(/_/g, " ");
    });
}

function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        year = d.getFullYear();
    if (month.length < 2) {
        month = '0' + month;
    }
    return [year, month].join('-');
}