import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import { abstractField } from "vue-form-generator";

export default {
    mixins: [ abstractField ],
    data () {
        return {
            loading:true,
            search: null,
            models: []
        }
    },

    watch: {
        search (val) {
            this.querySelections(val)
        },
        value:{
            immediate:true,
            handler(newVal){
                Meteor.call(this.schema.methodName,{values:newVal},(err,models)=>{
                    this.models = models;
                    let condition = {};
                    if(this.query){
                        condition['searchText'] = this.query;
                    }
                    if(!this.value)
                        return this.loading = false;
                    Meteor.call(this.schema.methodName, condition, (err, models) => {
                        _.each(models, model => {
                            let index = this.value.indexOf(model['value']);
                            if (index == -1)
                                this.models.push(model);
                        });
                        this.loading = false;
                    });
                });
            }
        }
    },

    methods: {
        querySelections (query) {
            this.loading = true;
            let values = _.isString(this.value)?[this.value]:this.value;
            values = _.compact(values);
            let condition = {};
            if(query){
                condition['searchText'] = query;
            }
            if(!_.isEmpty(values)){
                condition['values']=values;
            }
            Meteor.call(this.schema.methodName,condition,(err,models)=>{
                this.models = models;
                this.loading = false;
            });
        },
        remove (item) {
            const index = this.value.indexOf(item.value);
            if (index >= 0) this.value.splice(index, 1);
        }
    }
}