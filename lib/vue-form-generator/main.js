//@ts-ignore
import component from "./formGenerator.vue";
import * as schema  from "./utils/schema.js";
import validators from "./utils/validators.js";
import fieldComponents from "./utils/fieldsLoader";
import abstractField  from "./fields/abstractField";
const install = (Vue, options) => {
	Vue.component("VueFormGenerator", module.exports.component);
	if (options && options.validators) {
		for (let key in options.validators) {
			if ({}.hasOwnProperty.call(options.validators, key)) {
				validators[key] = options.validators[key];
			}
		}
	}
};

export {
	component,
	schema,
	validators,
	abstractField,
	fieldComponents,
	install
};
