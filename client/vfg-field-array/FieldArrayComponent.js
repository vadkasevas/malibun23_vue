import * as VueFormGenerator from "../../lib/vue-form-generator/main";
import isFunction from 'lodash.isfunction';
import isArray from 'lodash.isarray';
import isString from 'lodash.isstring';

import forEach from 'lodash.foreach';
import cloneDeep from 'lodash.clonedeep';
import Vue from "vue";

export default {
    mixins: [VueFormGenerator.abstractField],
    computed: {
        fieldId() {
            return this.getFieldID(this.schema);
        },
        newElementButtonLabel() {
            if (typeof this.schema.newElementButtonLabel !== "undefined") {
                return this.schema.newElementButtonLabel;
            }

            return "+ New";
        },
        removeElementButtonLabel() {
            if (typeof this.schema.removeElementButtonLabel !== "undefined") {
                return this.schema.removeElementButtonLabel;
            }

            return "x";
        },
        moveElementUpButtonLabel() {
            if (typeof this.schema.moveElementUpButtonLabel !== "undefined") {
                removeElementButtonLabel();
                return this.schema.moveElementUpButtonLabel;
            }

            return "↑";
        },
        moveElementDownButtonLabel() {
            if (typeof this.schema.moveElementDownButtonLabel !== "undefined") {
                return this.schema.moveElementDownButtonLabel;
            }

            return "↓";
        }
    },
    methods: {
        generateSchema(rootValue, schema, index) {
            let newSchema = {...schema};

            if (typeof this.schema.inputName !== "undefined") {
                newSchema.inputName = this.schema.inputName + "[" + index + "]";
            }

            newSchema.id = this.fieldId + index;

            return {
                ...newSchema,
                set(model, value) {
                    Vue.set(rootValue, index, value);
                },
                get(model) {
                    return rootValue[index];
                }
            };
        },
        generateInputName(index) {
            if (typeof this.schema.inputName === "undefined") {
                return null;
            }

            return this.schema.inputName + "[" + index + "]";
        },
        newElement() {
            let value = this.value;
            let itemsDefaultValue = undefined;

            if (!value || !value.push) value = [];

            if (this.schema.items && this.schema.items.default) {
                itemsDefaultValue = cloneDeep(this.schema.items.default);
            }

            value.push(itemsDefaultValue);

            this.value = [...value];
        },
        removeElement(index) {
            this.value.splice(index, 1);
        },
        moveElementDown(index) {
            let to = index + 1;
            if (to >= this.value.length) {
                to = 0;
            }
            this.value.splice(to, 0, this.value.splice(index, 1)[0]);
        },
        moveElementUp(index) {
            let to = index - 1;
            if (to < 0) {
                to = this.value.length;
            }
            this.value.splice(to, 0, this.value.splice(index, 1)[0]);
        },
        getFieldType(fieldSchema) {
            return "field-" + fieldSchema.type;
        },
        modelUpdated() {},
        validate(calledParent) {
            this.clearValidationErrors();
            let validateAsync = this.formOptions.validateAsync || false;
            let results = [];

            forEach(this.$children, child => {
                if (isFunction(child.validate)) {
                    results.push(child.validate(true));
                }
            });

            let handleErrors = errors => {
                let fieldErrors = [];
                let errorPrepend =
                    "[" +
                    (this.schema.label ? this.schema.label : this.schema.name) +
                    "] ";
                forEach(errors, err => {
                    if (isArray(err) && err.length > 0) {
                        forEach(err, singleErr => {
                            fieldErrors.push(errorPrepend + singleErr);
                        });
                    } else if (isString(err)) {
                        fieldErrors.push(errorPrepend + err);
                    }
                });
                if (isFunction(this.schema.onValidated)) {
                    this.schema.onValidated.call(
                        this,
                        this.model,
                        fieldErrors,
                        this.schema
                    );
                }

                let isValid = fieldErrors.length == 0;
                if (!calledParent) {
                    this.$emit("validated", isValid, fieldErrors, this);
                }
                this.errors = fieldErrors;
                return fieldErrors;
            };

            if (!validateAsync) {
                return handleErrors(results);
            }

            return Promise.all(results).then(handleErrors);
        }
    }
};