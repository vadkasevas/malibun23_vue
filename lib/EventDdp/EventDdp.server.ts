import {Meteor} from 'meteor/meteor';
import {EventEmitter} from "events";
import {Mongo} from 'meteor/mongo';
/// <reference path="./../../typings/meteor/malibun23:stack.d.ts" />

declare module "meteor/mongo"{
    module Mongo{
        export interface ObjectID {
            _str: string;
        }
    }
}


Meteor.publish('EventDdpSubscription',function(channel,options){
    let emitter = EventDdp.forChannel(channel);
    emitter.on('added',(data)=>{
        let _id = data._id ?data._id:new Mongo.ObjectID()._str;
        this.added('EventDdp',_id,data);
    });

    this.ready();
});

export class EventDdp extends EventEmitter{
    channel:string;
    static instances = {};

    constructor(channel:string){
        super();
        this.setMaxListeners(0);
        this.channel = channel;
    }

    static forChannel(channel:string){
        if(!EventDdp.instances[channel]){
            EventDdp.instances[channel] = new EventDdp(channel);
        }
        return EventDdp.instances[channel];
    }

    destroy(){
        this.removeAllListeners('data');
        if( EventDdp.instances[this.channel] ){
            delete EventDdp.instances[this.channel];
        }
    }
}