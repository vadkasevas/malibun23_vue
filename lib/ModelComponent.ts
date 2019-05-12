import {Meteor} from "meteor/meteor";
//@ts-ignore
import Vue from 'vue';
import {_} from 'meteor/underscore';

export default Vue.extend({
    //mixins: [MeteorComponent],
    props:['collection'],
    data() {
        return {model: {}}
    },
    meteor:{
        model () {
            let collectionName = _.isString(this.collection)? this.collection:this.collection._name;
            //@ts-ignore
            let collection = Meteor.connection._stores[collectionName]._getCollection();
            return collection.findOne({_id:this.$route.params._id})
        }
    },
    watch:{
        model:function(newReady){
            console.log('modelComponent model changed')
        },
        '$route': {
            immediate: true,
            handler(newVal, oldVal) {
                let collectionName = _.isString(this.collection)? this.collection:this.collection._name;
                this.$subscribe(collectionName, () => [{_id:this.$route.params._id}]);
                console.log(newVal, oldVal)
            },
        },
    }
});