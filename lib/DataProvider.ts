/// <reference path="../typings/meteor/malibun23:stack.d.ts" />
import {MalibunCollection} from 'meteor/malibun23:stack';
import {EventEmitter} from "events";
import {EventDdp} from "./EventDdp/EventDdp.client";
import {_} from 'meteor/underscore';

export class DataProvider<T>  extends EventEmitter{
    collection:MalibunCollection<T>;
    subscription:Meteor.SubscriptionHandle|null;
    isReady:boolean=false;
    changeQueued:boolean = false;
    modelsMap:object={};
    eventDdp:EventDdp=null;
    subscriptionName:string='dataStream';

    constructor(collection:MalibunCollection<T>){
        super();
        this.collection = collection;
        this.subscription=null;
        this.isReady = false;
        this.once('ready',()=>{
            this.isReady=true;
        });
    }

    get models(){
        return _.values(this.modelsMap);
    }

    change(){
        if(!this.changeQueued){
            this.changeQueued=true;
            setTimeout(()=>{
                this.changeQueued=false;
                this.emit('change');
            },0);
        }
    }

    subscribe(selector:Mongo.Selector<T>,options?:{sort?:{};skip?: number;limit?: number;fields?:{}}):this{
        this.eventDdp = new EventDdp();
        this.eventDdp.subscriptionName = this.subscriptionName;
        this.eventDdp.subscribe(this.collection._name,selector,options,{
            onReady: ()=>{
                this.emit('ready');
            }
        });
        let transform = this.collection._options['transform'];
        this.eventDdp.on('event',(type,data)=>{
            //if( this.constructor.name=='DataCountProvider' )
            //    console.log('event',type,data);
        });
        this.eventDdp.on('added',(data)=>{
            let model = transform(data);
            this.modelsMap[model._id] = model;
            //if( this.constructor.name=='DataCountProvider' )
            //    console.log('new model added',model);
            this.change();
        });
        this.eventDdp.on('changed',(data)=>{
            let model = transform(data);
            this.modelsMap[model._id] = model;
            this.change();
        });
        this.eventDdp.on('removed',(data)=>{
            delete this.modelsMap[data._id];
            this.change();
        });
        if(!this.changeQueued){
            this.emit('change');
        }
        return this;
    }

    ready(cb):this{
        if(this.isReady){
            return cb();
        }
        this.once('ready',cb);
    }

    autorun(cb):this{
        this.ready(()=>{
            this.on('change',cb);
            if(!_.isEmpty(this.models)){
                this.change();
            }
        });
        return this;
    }

    stop(){
        this.removeAllListeners('change');
        this.removeAllListeners('ready');
        if(this.eventDdp){
            this.eventDdp.stop();
        }
    }
}