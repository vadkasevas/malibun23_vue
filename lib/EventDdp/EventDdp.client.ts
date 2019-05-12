/// <reference path="./../../typings/meteor/meteor.d.ts" />
/// <reference path="./../../typings/meteor/malibun23:stack.d.ts" />
import {Meteor} from 'meteor/meteor';
import {EventEmitter} from 'events';
import {Minimongo} from 'meteor/minimongo';
import {generateRandomHash} from "meteor/malibun23:stack";
import {_} from 'meteor/underscore';

export class EventDdp extends EventEmitter{
    connection:Meteor.Connection;
    channel:string;
    eventEmitter:EventEmitter;
    subscription:Meteor.SubscriptionHandle;
    static store:any;
    store:any;
    static channelEmitter = new EventEmitter().setMaxListeners(0);
    channelEmitterListener:(...args: any[]) => void;
    subscriptionName:string='EventDdpSubscription';

    constructor() {
        super();
        this.setMaxListeners(0);
        this.channel = generateRandomHash();
        let connection = Meteor.connection;
        this.connection=connection;
        let store = connection._stores['EventDdp'];
        if(!store){
            connection.registerStore('EventDdp', {
                beginUpdate: function (batchSize, reset) {},
                update: (msg)=>{
                    //console.log('msg:',msg);
                    if (msg.msg == 'added' ||msg.msg == 'changed') {
                        let channel = msg.fields&&msg.fields.channel?msg.fields.channel:null;
                        if(!channel){
                            channel = String( msg.id ).split(':')[0];
                        }
                        let type = msg.fields && msg.fields.type ? msg.fields.type:msg.msg;
                        EventDdp.channelEmitter.emit.apply(EventDdp.channelEmitter,[channel, type , msg.fields.data]);//id?
                    }
                    if(msg.msg=='removed'){
                        let idData = String( msg.id ).split(':');
                        let channel = idData[0];
                        let id = idData[1];
                        if(channel&&id){
                            EventDdp.channelEmitter.emit.apply(EventDdp.channelEmitter,[channel, 'removed' , {_id:id}]);//id?
                        }
                    }
                },
                endUpdate: function () {},
                saveOriginals: function () {},
                retrieveOriginals: function () {}
            });
        }

        this.channelEmitterListener = (type,data)=>{
            this.emit('event',type,data);
            this.emit(type,data);
        };
        EventDdp.channelEmitter.on(this.channel,this.channelEmitterListener);

    }

    subscribe(...args: any[]):this{
        if(this.subscription)
            throw new Error('subscription already created');
        let sargs = [this.subscriptionName,this.channel];
        sargs = sargs.concat(_.toArray(args));
        this.subscription = Meteor.subscribe.apply(Meteor,sargs);
        return this;
    }

    stop(){
        this.subscription.stop();
        EventDdp.channelEmitter.removeListener(this.channel,this.channelEmitterListener);
    }


}