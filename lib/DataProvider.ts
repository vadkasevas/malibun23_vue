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
    eventDdpSubscriptionName:string='dataStream';
    meteorSubscriptionName:string;

    constructor(collection:MalibunCollection<T>,meteorSubscriptionName:string|null){
        super();
        this.collection = collection;
        this.meteorSubscriptionName = meteorSubscriptionName||collection._name;
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

    doSubscription(selector:Mongo.Selector<T>,options?:{sort?:{};skip?: number;limit?: number;fields?:{}}){
        this.eventDdp = new EventDdp();
        this.eventDdp.subscriptionName = this.eventDdpSubscriptionName;
        this.eventDdp.subscribe(this.meteorSubscriptionName,selector,options,{
            onReady: ()=>{
                this.emit('ready');
            }
        });
    }

    subscribe(selector:Mongo.Selector<T>,options?:{sort?:{};skip?: number;limit?: number;fields?:{}}):this{
        this.doSubscription(selector, options);
        let transform = this.collection._options?this.collection._options['transform']:this.collection._transform;
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