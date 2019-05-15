/// <reference path="../typings/meteor/malibun23:stack.d.ts" />
import {MalibunCollection} from 'meteor/malibun23:stack';
import {EventEmitter} from 'events';
import {Meteor} from 'meteor/meteor';
import {Mongo} from "meteor/mongo";

export class CollectionTracker<T> extends EventEmitter{
    collection:MalibunCollection<T>;
    subscription:Meteor.SubscriptionHandle|null;
    isReady:boolean=false;
    changeQueued:boolean = false;

    constructor(collection:MalibunCollection<T>){
        super();
        this.collection = collection;
        this.subscription=null;
        this.isReady = false;
        this.once('ready',()=>{
            this.isReady=true;
        });
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

    subscribe(selector:Mongo.Selector<T>):this{
        const self = this;
        this.subscription = Meteor.subscribe(this.collection._name,selector,{
            onReady: function () {
                self.emit('ready');
            }
        });
        this.ready(()=>{
            this.collection.find(selector).observeChanges({
                added:()=>{
                    this.change();
                },
                changed:()=>{
                    this.change();
                },
                removed:()=>{
                    this.change();
                }
            });
            if(!this.changeQueued){
                this.emit('change');
            }
        });
        return this;
    }

    ready(cb):CollectionTracker<T>{
        if(this.isReady){
            return cb();
        }
        this.once('ready',cb);
    }

    autorun(cb):CollectionTracker<T>{
        this.ready(()=>{
           this.on('change',cb);
        });
        return this;
    }

    stop(){
        if(this.subscription){
            this.subscription.stop();
        }
    }
}