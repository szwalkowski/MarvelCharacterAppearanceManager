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
    Handlebars.registerHelper("timestampToTime", function (timestamp) {
        return formatTime(new Date(timestamp));
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

function formatTime(date) {
    const yyyy = date.getFullYear();
    let mm = (date.getMonth() + 1);
    if (mm < 10) {
        mm = "0" + mm;
    }
    let dd = date.getDate();
    if (dd < 10) {
        dd = "0" + dd;
    }
    let hours = date.getHours();
    if (hours < 10) {
        hours = "0" + hours;
    }
    let minutes = date.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    let seconds = date.getSeconds();
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return yyyy + "-" + mm + "-" + dd + " " + hours + ":" + minutes + ":" + seconds;

}