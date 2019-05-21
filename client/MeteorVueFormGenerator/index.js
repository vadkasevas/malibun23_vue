import VueFormGenerator from "vue-form-generator";
import MeteorVueFormGenerator from './MeteorVueFormGenerator';

const component = VueFormGenerator.component;
const schema = VueFormGenerator.schema;
const validators =VueFormGenerator.validators;
const fieldComponents = VueFormGenerator.fieldComponents;
const abstractField = VueFormGenerator.abstractField;

const install = (Vue, options) => {
    Vue.component("VueFormGenerator", VueFormGenerator.component);
    if (options && options.validators) {
        for (let key in options.validators) {
            if ({}.hasOwnProperty.call(options.validators, key)) {
                validators[key] = options.validators[key];
            }
        }
    }
    //Vue.component("VueFormGenerator", MeteorVueFormGenerator);
};

export {
    component,
    schema,
    validators,
    abstractField,
    fieldComponents,
    install
};
