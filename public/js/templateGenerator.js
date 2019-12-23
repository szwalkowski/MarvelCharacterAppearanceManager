const cachedTemplates = {};

const provideTemplate = {
    get: (templateName, callback) => {
        if (cachedTemplates[templateName]) {
            return callback(cachedTemplates[templateName]);
        }
        $.get(`/templates/${templateName}.hbs`, (data) => {
            cachedTemplates[templateName] = Handlebars.compile(data);
            callback(cachedTemplates[templateName]);
        });
    }
};