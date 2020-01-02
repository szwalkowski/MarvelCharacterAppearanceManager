const cachedTemplates = {};

const provideTemplate = {
    get: (templateName, callback) => {
        if (cachedTemplates[templateName]) {
            return callback(cachedTemplates[templateName]);
        }
        $.get(`/templates/${templateName}.hbs`, (data) => {
            timestampToDate();
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

function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        year = d.getFullYear();
    if (month.length < 2) {
        month = '0' + month;
    }
    return [year, month].join('-');
}