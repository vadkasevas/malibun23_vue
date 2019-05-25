<template>
  <div>
    <div v-if="schema.schema">
      <vue-form-generator :schema="schema.schema" :model="value" :options="formOptions"></vue-form-generator>
    </div>
    <div v-else>
      <table :id="getFieldID(schema)" :class="schema.fieldClasses">
        <tr v-for="(item, index) in value">
          <td>
            {{index}}
          </td>
          <td v-if="keyTypes[index] === 'string'">
            <input type="text" v-model="value[index]"/>
          </td>
          <td v-if="keyTypes[index] === 'boolean'">
            <input type="checkbox" v-model="value[index]"/>
          </td>
          <td v-if="keyTypes[index] === 'number'">
            <input type="number" v-model="value[index]"/>
          </td>
          <td>
            <input type="button" value="x" @click="removeElement(index)"/>
          </td>
        </tr>
      </table>
      <select v-model="newKeyType">
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="boolean">Boolean</option>
      </select>
      <input type="text" v-model="newKeyName"/>
      <input type="button" value="Add key" @click="addKey"/>
    </div>
  </div>
</template>

<script>
  import * as VueFormGenerator from "../../../../lib/MeteorVueFormGenerator/index";
  import {_} from 'meteor/underscore';
  import { get as objGet, isFunction, isNil, isArray } from "lodash";

  export default {
    mixins: [VueFormGenerator.abstractField],

    created() {
      if (!this.value) this.value = {};
    },

    mounted() {
        console.log(this);
      if (!this.value) return;

      let valueKeys = Object.keys(this.value);
      let keyTypes = {};

      for (let i = 0; i < valueKeys.length; i++) {
        let key = valueKeys[i];
        keyTypes[key] = typeof this.value[key];
      }
      this.keyTypes = keyTypes;
    },

    data() {
      return {
        newKeyType: "string",
        newKeyName: "",
        keyTypes: {}
      };
    },

    methods: {
      removeElement(index) {
        let value = this.value;
        delete value[index];

        this.value = { ...value };

        let keyTypes = this.keyTypes;
        delete keyTypes[index];

        this.keyTypes = { ...keyTypes };
      },

      addKey() {
        //TODO change to vm.$set
        try {
          //Vue.set (this.value, this.newKeyName, undefined);
          //Vue.set (this.keyTypes, this.newKeyName, this.newKeyType);
          this.newKeyName = "";
        }catch (e) {
          console.log(e);
        }
      },

        validate(isAsync = null) {
            if (isAsync === null) {
                isAsync = objGet(this.formOptions, "validateAsync", false);
            }
            this.clearValidationErrors();

            let fields = [];
            let results = [];

            _.each(this.$children, child => {
                if (isFunction(child.validate)) {
                    fields.push(child.$refs.child); // keep track of validated children
                    results.push(child.validate(true));
                }
            });

            let handleErrors = errors => {
                console.log({errors});
                let formErrors = [];
                _.each(errors, (err, i) => {
                    if (isArray(err) && err.length > 0) {
                        _.each(err, error => {
                            formErrors.push(error.error);
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
        }
    }
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
