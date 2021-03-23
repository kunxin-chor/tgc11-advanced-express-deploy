const forms = require("forms");
// create some shortcutsd
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};

// the first argument should be an array of possible options for the category field
const createProductForm = (categories) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true,
            cssClass: {
                label: ['form-label']
            }
        }),
        'cost': fields.string({
            required: true,
            errorAfterField: true,
            cssClass: {
                label: ['form-label']
            },
            validators:[validators.integer()]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            cssClass: {
                label: ['form-label']
            }
        }),
        'category_id': fields.string({
            label:'Category',
            required: true,
            errorAfterField: true,
            cssClasses: ['form-label'],
            widget: widgets.select(),
            choices: categories
           
        })
    });
}

module.exports = { createProductForm, bootstrapField}