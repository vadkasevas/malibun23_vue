import { abstractField } from "vue-form-generator";
import {_} from 'meteor/underscore';

export default {
    data(){
        return{
            currentUpload:null,
            file:null
        };
    },

    computed:{
        accept(){
            if(_.isEmpty(this.schema.accept))
                return '';
            return _.chain( this.schema.accept )
                .map((ext)=>{
                    return `.${ext}`;
                })
                .value()
                .join(',');
        },
        audioPreview(){
            let isAudioFile = this.file && this.file.isAudio;
            return this.schema.preview=='audio' || ( this.schema.preview=='auto' && isAudioFile );
        },
        link(){
            return this.file ? this.schema.collection.link( this.file ) : null;
        },
        progressStyle(){
            return `width: ${this.currentUpload.progress.get()}%`;
        }
    },
    methods:{
        onDrop($event){
            let self = this;
            let schema = self.schema;
            console.log($event);
        },
        onChange($event){
            let self = this;
            let schema = self.schema;

            if ($event.target.files && $event.target.files[0]) {
                let meta = {};
                if(schema.meta){
                    if(_.isFunction(schema.meta)){
                        meta = schema.meta.apply(self);
                    }else{
                        meta = schema.meta;
                    }
                }
                var upload = this.schema.collection.insert({
                    file: $event.target.files[0],
                    streams: 'dynamic',
                    chunkSize: 'dynamic',
                    meta:meta
                }, false);

                upload.on('start', function () {
                    if(self.schema.start)
                        self.schema.start.apply(self);
                    self.value = null;
                    self.currentUpload = this;
                });
                upload.on('end', function (error, fileObj) {
                    self.value = fileObj._id;
                    self.file = fileObj;
                    if(self.schema.end)
                        self.schema.end.apply(self,[error,fileObj]);
                    self.currentUpload= null;
                });

                upload.start();
            }
        },

        updated() {
            this.$nextTick(function () {
                this.file = this.schema.collection.findOne(this.value);
            })
        }
    },
    mixins: [ abstractField ],
    //props:['accept','collection']
};