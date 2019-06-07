import {Meteor} from 'meteor/meteor';
import {_} from 'meteor/underscore';
import { abstractField } from "vue-form-generator";

export default {
    name:'form-autocomplete',
    mixins: [ abstractField ],
    props: {

    },
    data () {
        return {
            loading:true,
            search: null,
            models: [],
            showUnselected:false
        }
    },
    computed: {
        placeholder(){
            return this.schema.placeholder||'';
        },
        multiple(){
            return this.schema.multiple;
        },
        unselectedItems(){
            var values = [];
            if(this.multiple){
                _.each(this.value,(val)=>{
                    values.push(val);
                })
            }else if (this.value!==null){
                values.push(this.value);
            }
            return _.filter(this.models,(model)=>{
                return values.indexOf(model.value)==-1;
            });
        },
        selectedItems() {
            var values = [];
            if(this.multiple){
                _.each(this.value,(val)=>{
                    values.push(val);
                })
            }else if (this.value!==null){
                values.push(this.value);
            }
            return _.filter(this.models,(model)=>{
                return values.indexOf(model.value)>-1;
            });
        },
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
            }else{
                this.value = null;
            }
        },
        showOptions() {
            this.showUnselected = true;
        },
        addItem(item) {
            this.showUnselected = false;
            if(!this.multiple){
                this.value = item.value;
            }else{
                if(!_.find(this.value,(val)=>{
                    return item.value == val;
                })){
                    this.value.push(item.val);
                }
            }
        }
    },
}
