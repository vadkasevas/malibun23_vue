import {Meteor} from "meteor/meteor";
//@ts-ignore
import Vue from 'vue';
import {_} from 'meteor/underscore';

export default Vue.extend({
    props:{
        collection: {
            type: String
        },
        property:{
            type:String,
            default:'model'
        }
    },
    data(){
        return {subscription:null}
    },
    destroyed(){
        this.stopSubscription();
    },
    watch:{
        '$route': {
            immediate: true,
            handler(newVal, oldVal) {
                this.subscribe(()=>{
                    //@ts-ignore
                    let collection = Meteor.connection._stores[this.collection]._getCollection();
                    this[this.property] = collection.findOne({_id:this.$route.params._id})
                });
            },
        },
    },
    methods:{
        stopSubscription(){
            if(this.subscription){
                this.subscription.stop();
                this.subscription=null;
            }
        },
        subscribe(cb){
            this.stopSubscription();
            this.subscription = Meteor.subscribe(this.collection,{_id:this.$route.params._id},{
                onReady: function () {
                    cb();
                }
            });
        }
    }

});