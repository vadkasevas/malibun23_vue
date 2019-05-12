import { abstractField } from "vue-form-generator";
import {_} from 'meteor/underscore';
import {generateRandomHash} from "meteor/malibun23:stack";
import {cloneDeep} from 'lodash';
import {Meteor} from "meteor/meteor";

class FileItem{
    file:object=null;
    upload:any=null;
    _id:string=generateRandomHash();
    progress:number=0;

    constructor(){

    }

    get progressStyle(){
        return `width: ${this.progress}%`;
    }
}

export default {
    data(){
        return{
            subscribed:false,
            items:[]
        };
    },

    watch:{
        value:{
            immediate:true,
            handler(newValue,oldValue){
                if(!oldValue){
                    if(!_.isEmpty(newValue)) {
                        let collectionName = _.isString(this.schema.collection)? this.schema.collection:this.schema.collection.collectionName;
                        let collection = Meteor.connection._stores['uploadFiles']._getCollection();
                        Meteor.subscribe(collectionName,{_id:{$in:newValue}},()=>{
                            let files = collection.find({_id:{$in:this.value}}).fetch();
                            this.items = _.map(files,(file)=>{
                                let item = new FileItem();
                                item.file = file;
                                return item;
                            });
                            this.subscribed = true;
                        });
                    }
                }
            }
        }
    },

    mounted(){
        console.log('VueMeteorFiles mounted,this.schema:',this.schema);
    },

    created: function () {
        this.$nextTick(function () {

        })
    },

    updated:function() {
        console.log('VueMeteorFiles UPDATED');
        this.$nextTick(function () {

        });
    },

    methods:{
        removeItem(index){
            let removed = this.items.splice(index, 1);
            _.each(removed,(item:FileItem)=>{
                this.value = _.filter(this.value,(file_id)=>{
                    return !item.file||file_id!=item.file['_id'];
                });
            });
            this.value = [...this.value];
        },
        audioPreview(file){
            let isAudioFile = file && file.isAudio;
            return this.schema.preview=='audio' || ( this.schema.preview=='auto' && isAudioFile );
        },
        onChange($event){
            let self = this;
            let schema = self.schema;
            let collectionName = _.isString(this.schema.collection)? this.schema.collection:this.schema.collection.collectionName;
            let collection = Meteor.connection._stores[collectionName]._getCollection().filesCollection;

            _.each($event.target.files,($file:any,index)=>{
                if($file['size']==0)
                    return;
                let item = new FileItem();

                let meta = {};
                if(schema.meta){
                    if(_.isFunction(schema.meta)){
                        meta = schema.meta.apply(self);
                    }else{
                        meta = schema.meta;
                    }
                }
                var upload = collection.insert({
                    file: $file,
                    streams: 'dynamic',
                    chunkSize: 'dynamic',
                    meta:meta
                }, false);

                upload.on('start', function () {
                    if(self.schema.start)
                        self.schema.start.apply(self);
                });
                upload.on('end', function (error, fileObj) {
                    let itemIndex = -1;
                    _.each(self.items,(_item:FileItem,_index)=>{
                         if(_item._id==item._id){
                             itemIndex=_index;
                         }
                    });
                    if(itemIndex>-1)
                        self.value[itemIndex] = fileObj._id;
                    self.value = [...self.value];
                    item.file = fileObj;
                    if(self.schema.end)
                        self.schema.end.apply(self,[error,fileObj]);
                });
                upload.on('progress',(progress)=>{
                    item.progress=progress;
                });
                upload.start();
                item.upload = upload;
                self.items.push(item);
            });
        },

        updated() {
            /*this.$nextTick(function () {
                this.items = _.map(this.value,(file_id)=>{
                    let item = new FileItem();
                    item.file = this.schema.collection.findOne(file_id);
                    return item;
                });
            });*/
        },

        link(file){
            let collectionName = _.isString(this.schema.collection)? this.schema.collection:this.schema.collection.collectionName;
            let collection = Meteor.connection._stores[collectionName]._getCollection().filesCollection;
            return collection.link( file );
        }
    },
    mixins: [ abstractField ]
};