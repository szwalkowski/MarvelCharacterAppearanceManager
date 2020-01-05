const cachedTemplates = {};

const provideTemplate = {
    get: (templateName, callback) => {
        if (cachedTemplates[templateName]) {
            return callback(cachedTemplates[templateName]);
        }
        $.get(`/templates/${templateName}.hbs`, (data) => {
            timestampToDate();
            helperForSpaceUnderscoreEscaping();
            cachedTemplates[templateName] = Handlebars.compile(data);
            callback(cachedTemplates[templateName]);
        });
    }
};

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