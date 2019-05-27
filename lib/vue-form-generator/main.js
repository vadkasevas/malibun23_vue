//@ts-ignore
import component from "./formGenerator.vue";
import * as schema  from "./utils/schema.js";
import validators from "./utils/validators.js";
import fieldComponents from "./utils/fieldsLoader";
import abstractField  from "./fields/abstractField";
const install = (Vue, options) => {
    console.log('Vue parentModel mixin');
    Vue.mixin({
        computed: {
            parentModel: {
                cache: false,
                get() {
                    function getChildVfg(comp){
                        if(!comp)
                            return null;
                        if (comp.$options && comp.$options.name == 'formGenerator') {
                            return comp;
                        }
                        if(comp.vfg)
                            return comp.vfg;
                        if(!comp.$parent)
                            return null;
                        return getChildVfg(comp.$parent);
                    }
                    function getParentModel (obj) {
                        if (!obj)
                            return null;
                        if (obj.$options && obj.$options.name == 'formGenerator') {
                            return obj.model;
                        }
                        return getParentModel (obj.$parent);
                    }
                    let vfg = getChildVfg(this);
                    if(!vfg)
                        return null;
                    return getParentModel(vfg.$parent);
                }
            }
        }
    });

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
