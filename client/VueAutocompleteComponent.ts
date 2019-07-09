import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import { abstractField } from "../lib/vue-form-generator/main";

export default {
    mixins: [ abstractField ],
    data () {
        return {
            loading:true,
            search: null,
            models: []
        }
    },

    computed:{
        multiple(){
            return this.schema.multiple;
        }
    },

    watch: {
        search (val) {
            this.querySelections(val)
        },
        value:{
            immediate:true,
            handler(newVal){
                if(!newVal||_.isEmpty(newVal)){
                    newVal=[];
                }else if(!this.multiple){
                    newVal = [newVal];
                }
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
                            if(this.multiple) {
                                let index = this.value.indexOf(model['value']);
                                if (index == -1)
                                    this.models.push(model);
                            }else{
                                if(this.value!=model['value'])
                                    this.models.push(model);
                            }
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
            let values = this.multiple?this.value:(()=>{
                return _.isEmpty(this.value)?[]:[this.value];
            })();
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
            if(this.multiple) {
                const index = this.value.indexOf(item.value);
                if (index >= 0) this.value.splice(index, 1);
            }else if(this.value==item.value){
                this.value = null;
            }
        },


    }
}