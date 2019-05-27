import * as VueFormGenerator from '../vue-form-generator/main';
import MeteorVueFormGenerator from './MeteorVueFormGenerator';

const component = VueFormGenerator.component;
const schema = VueFormGenerator.schema;
const validators =VueFormGenerator.validators;
const fieldComponents = VueFormGenerator.fieldComponents;
const abstractField = VueFormGenerator.abstractField;

const install = VueFormGenerator.install;

export {
    component,
    schema,
    validators,
    abstractField,
    fieldComponents,
    install
};
