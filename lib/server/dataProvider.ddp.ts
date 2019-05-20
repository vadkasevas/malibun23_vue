/// <reference path="../../typings/meteor/raix:eventddp.d.ts" />
/// <reference path="../../typings/meteor/malibun23:stack.d.ts" />

import {EventDDP} from 'meteor/raix:eventddp';

import {generateRandomHash, MalibunCollection,md5} from "meteor/malibun23:stack";
import {_} from 'meteor/underscore';
import {Meteor} from 'meteor/meteor';
import {Mongo} from "meteor/mongo";

Meteor.publish('dataStream',function(channel,collectionName, condition, options){
    let collection = MalibunCollection.byName(collectionName);
    if(!collection)
        throw new Meteor.Error('collection-not-found', "Can't find my collection");
    let self = this;
    options = options||{};
    if(!options.sort){
        options.sort = {text:1};
    }
    console.log(collectionName,condition,options);
    //@ts-ignore
    let observer = collection.publishCursor( Meteor.currentUser(this.userId), condition, options ).observeChanges({
        added(id,fields){
            fields['_id'] = id;
            let _id = `${channel}:${id}`;
            let data = {
                channel:channel,
                data:fields
            };
            self.added('EventDdp',_id,data);
        },
        changed(id){
            let _id = `${channel}:${id}`;
            let model = collection.findOne(id);
            if(model) {
                self.changed('EventDdp', _id, {
                    channel: channel,
                    data: model
                });
            }
        },
        removed(id){
            let _id = `${channel}:${id}`;
            // @ts-ignore
            self.removed('EventDdp',_id);
        }
    });
    this.ready();
    this.onStop(()=>{
        observer.stop();
    });
});
