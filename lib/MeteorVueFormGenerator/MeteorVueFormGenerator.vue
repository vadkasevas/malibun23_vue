<template>
    <div class="meteor-vue-form-generator">

        <original-vue-form-generator v-if="subscriptionsReady" :schema="schema" :model="model" :options="options" :multiple="multiple" :isNewModel="isNewModel" :tag="tag">

        </original-vue-form-generator>
        <vue-loading v-else/>
    </div>

</template>

<script>
    import {_} from 'meteor/underscore';

    export default {
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

        data(){
            return {
                subscriptions:null,
                subscriptionsReady:false
            }
        },

        watch: {
            // new model loaded
            model: function(newModel, oldModel) {
                this.subscribe();
            }
        },

        mounted() {
            this.$nextTick(() => {
                if (this.model) {
                    this.subscribe();
                }
            });
        },

        methods:{
            stopSubscriptions(){
                if(this.subscriptions){
                    _.each(this.subscriptions,(subscription)=>{
                        subscription.stop();
                    });
                    this.subscriptions=[];
                }
            },
            subscribe(){
                if(!this.schema.subscribe){
                    return this.subscriptionsReady=true;
                }
                if(this.subscriptions&&!_.isFunction(this.schema.subscribe))
                    return this.subscriptionsReady=true;

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
                    return this.subscriptionsReady = true;
                }

                function subsHash(subscriptions){
                    return _.map(subscriptions,(subscription)=>{
                        let result = [];
                        if(_.isArray(subscription)){
                            result = subscription;
                        }else{
                            result.push(subscription.name);
                            _.each(subscription.params,(param)=>{
                                result.push(param);
                            });
                        }
                        return JSON.stringify(result);
                    }).join(' ');
                }

                if(this.subscriptions && subsHash(this.subscriptions)==subsHash(subscriptions)){
                    return this.subscriptionsReady=true;
                }

                this.stopSubscriptions();
                this.subscriptionsReady = false;
                let promises = _.map(subscriptions,(subData)=>{
                    return new Promise((resolve)=>{
                        let subHandler = null;
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
                    });
                });
                Promise.all(promises).then((subscriptions)=>{
                    setTimeout(()=>{
                        this.subscriptions = subscriptions;
                        this.subscriptionsReady=true;
                    },1000);
                });
            }
        }
    }
</script>

<style lang="scss">
</style>
