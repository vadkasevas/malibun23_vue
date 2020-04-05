import { get as objGet, forEach, isFunction, isNil, isArray } from "lodash";

import formMixin from "./formMixin.js";
import formGroup from "./formGroup.vue";

const template = `
<div class="vue-form-generator" v-if="schema != null && subscriptionsReady">
    <fieldset v-if="schema.fields" :is="tag">
        <template v-for="field in fields">
            <form-group v-if="fieldVisible(field)" :vfg="vfg" :field="field" :errors="errors" :model="model" :options="options"
                @validated="onFieldValidated" @model-updated="onModelUpdated"
            />
        </template>
    </fieldset>

    <template v-for="group in groups">
        <fieldset v-if="fieldVisible(group)" :is="tag" :class="getFieldRowClasses(group)">
            <legend v-if="group.legend">{{ group.legend }}</legend>
            <template v-for="field in group.fields">
            <form-group v-if="fieldVisible(field)" :vfg="vfg" :field="field" :errors="errors" :model="model" :options="options"
                    @validated="onFieldValidated" @model-updated="onModelUpdated">
                    
</form-group>
</template>
        </fieldset>
    </template>
        
</div>
<vue-loading v-else/>
`;

export default {
    template:template,
    name: "formGenerator",
    components: { formGroup },
    mixins: [formMixin],
    props: {
        schema: Object,

        model: Object,

        options: {
            type: Object,
            default() {
                return {
                    validateAfterLoad: false,
                    validateAfterChanged: false,
                    fieldIdPrefix: "",
                    validateAsync: false,
                    validationErrorClass: "error",
                    validationSuccessClass: ""
                };
            }
        },

        multiple: {
            type: Boolean,
            default: false
        },

        isNewModel: {
            type: Boolean,
            default: false
        },

        tag: {
            type: String,
            default: "fieldset",
            validator: function(value) {
                return value.length > 0;
            }
        }
    },

    data() {
        return {
            vfg: this,
            errors: [], // Validation errors
            subscriptions:null,
            subscriptionsReady:false
        };
    },

    computed: {
        fields() {
            let res = [];
            if (this.schema && this.schema.fields) {
                forEach(this.schema.fields, field => {
                    if (!this.multiple || field.multi === true) res.push(field);
                });
            }

            return res;
        },
        groups() {
            let res = [];
            if (this.schema && this.schema.groups) {
                forEach(this.schema.groups.slice(0), group => {
                    res.push(group);
                });
            }

            return res;
        }
    },

    watch: {
        // new model loaded
        model: {
            deep:true,
            handler: function (newModel, oldModel) {
                this.subscribe().then(() => {
                    if (oldModel === newModel)
                    // model property changed, skip
                        return;

                    if (newModel != null) {
                        this.$nextTick(() => {
                            // Model changed!
                            if (this.options.validateAfterLoad === true && this.isNewModel !== true) {
                                this.validate();
                            } else {
                                this.clearValidationErrors();
                            }
                        });
                    }
                });
            }
        }
    },

    mounted() {
        this.$nextTick(() => {

            if (this.model) {
                this.subscribe().then(()=>{
                    // First load, running validation if neccessary
                    if (this.options.validateAfterLoad === true && this.isNewModel !== true) {
                        this.validate();
                    } else {
                        this.clearValidationErrors();
                    }
                });
            }

        });
    },

    destroyed(){
        this.stopSubscriptions();
    },

    methods: {
        stopSubscriptions(){
            if(this.subscriptions){
                _.each(this.subscriptions,(subscription)=>{
                    subscription.stop();
                });
                this.subscriptions=[];
            }
        },
        subscribe(){
            const self = this;
            return new Promise((resolve)=>{
                if(
                    !this.schema.subscribe
                    || (this.subscriptions&&!_.isFunction(this.schema.subscribe))
                ){
                    return resolve( this.subscriptionsReady=true );
                }

                let subscriptions = [];
                if(_.isFunction(this.schema.subscribe)){
                    subscriptions = this.schema.subscribe.apply(this,[this.model]);
                }else{
                    subscriptions = this.schema.subscribe;
                }
                if(!_.isArray(subscriptions)&&!_.isEmpty(subscriptions))
                    subscriptions=[subscriptions];
                if(_.isEmpty(subscriptions)){
                    this.stopSubscriptions();
                    return resolve( this.subscriptionsReady = true );
                }

                function checkSubscriptions(subParams){
                    let result = true;
                    _.each(subParams,(subParam)=>{
                        let oldSub = _.find(self.subscriptions,(sub)=>{
                            return sub.rawParamString == EJSON.stringify(subParam);
                        });
                        if(!oldSub)
                            result = false;
                    });
                    return result;
                }

                if(this.subscriptions && checkSubscriptions(subscriptions)){
                    return resolve( this.subscriptionsReady=true );
                }

                this.stopSubscriptions();
                this.subscriptionsReady = false;
                let promises = _.map(subscriptions,(subData)=>{
                    return new Promise((resolve)=>{
                        let subHandler = null;
                        let rawParamString = EJSON.stringify(subData);
                        subData.push({
                            onReady: function () {
                                if(subHandler) {
                                    resolve(subHandler);
                                }else{
                                    setTimeout(()=>{
                                        resolve(subHandler);
                                    },0);
                                }
                            }
                        });
                        subHandler = Meteor.subscribe.apply(null,subData);
                        subHandler.rawParamString = rawParamString;
                    });
                });
                return Promise.all(promises).then((subscriptions)=>{
                    return new Promise((resolve)=>{
                        //setTimeout(()=>{
                        this.subscriptions = subscriptions;
                        resolve( this.subscriptionsReady=true );
                        //},1000);
                    });
                });
            });

        },

        // Get visible prop of field
        fieldVisible(field) {
            if (isFunction(field.visible)) return field.visible.call(this, this.model, field, this);

            if (isNil(field.visible)) return true;

            return field.visible;
        },

        // Child field executed validation
        onFieldValidated(res, errors, field) {
            // Remove old errors for this field
            this.errors = this.errors.filter(e => e.field !== field.schema);

            if (!res && errors && errors.length > 0) {
                // Add errors with this field
                forEach(errors, err => {
                    this.errors.push({
                        field: field.schema,
                        error: err
                    });
                });
            }

            let isValid = this.errors.length === 0;
            this.$emit("validated", isValid, this.errors, this);
        },

        onModelUpdated(newVal, schema) {
            this.$emit("model-updated", newVal, schema);
        },

        // Validating the model properties
        validate(isAsync = null) {
            if (isAsync === null) {
                isAsync = objGet(this.options, "validateAsync", false);
            }
            this.clearValidationErrors();

            let fields = [];
            let results = [];

            forEach(this.$children, child => {
                if (isFunction(child.validate)) {
                    fields.push(child.$refs.child); // keep track of validated children
                    results.push(child.validate(true));
                }
            });

            let handleErrors = errors => {
                let formErrors = [];
                forEach(errors, (err, i) => {
                    if (isArray(err) && err.length > 0) {
                        forEach(err, error => {
                            formErrors.push({
                                field: fields[i].schema,
                                error: error
                            });
                            console.log('formGenerator formErrors:',formErrors);
                        });
                    }
                });
                this.errors = formErrors;
                let isValid = formErrors.length === 0;
                this.$emit("validated", isValid, formErrors, this);
                return isAsync ? formErrors : isValid;
            };

            if (!isAsync) {
                return handleErrors(results);
            }

            return Promise.all(results).then(handleErrors);
        },

        // Clear validation errors
        clearValidationErrors() {
            this.errors.splice(0);

            forEach(this.$children, child => {
                child.clearValidationErrors();
            });
        },
    }
};