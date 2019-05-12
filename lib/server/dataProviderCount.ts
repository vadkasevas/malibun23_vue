/// <reference path="../../typings/meteor/malibun23:stack.d.ts" />
import {Meteor} from "meteor/meteor";
import {MalibunCollection} from "meteor/malibun23:stack";
import {_} from 'meteor/underscore';

Meteor.publish('dataProviderCount',function(channel,collectionName, condition, options){
    console.log({condition});
    let collection = MalibunCollection.byName(collectionName);
    if(!collection)
        throw new Meteor.Error('collection-not-found', "Can't find my collection");
    const self = this;
    let wasAdded = false;

    let currentObserver = null;
    this.onStop(()=>{
        if(currentObserver!=null){
            currentObserver.stop();
        }
    });

    let onChanged = _.throttle(function(count){
        if(!wasAdded){
            self.added('EventDdp',`${channel}:count`,{data:{count:count}});
            wasAdded=true;
        }else{
            self.changed('EventDdp',`${channel}:count`,{data:{count:count}});
        }
    },1000);

    function iteration(){
        let count = collection.find(condition).count();
        onChanged(count);

        let observer = null;
        function recursive(){
            Meteor.setTimeout(()=>{
                if(observer!==null)
                    observer.stop();
                iteration();
            },0);
        }

        if(count<=100){
            let idsMap = {};
            let observeWaiting = true;

            observer=collection.find(condition).observeChanges({
                added(_id){
                    let isNew = !idsMap[_id];
                    idsMap[_id] = true;
                    if(isNew&&!observeWaiting){
                        let observeCount = _.size(idsMap);
                        onChanged(observeCount);
                        if(observeCount>200){
                            recursive();
                        }
                    }
                },
                removed(_id){
                    delete idsMap[_id];
                    let observeCount = _.size(idsMap);
                    onChanged(observeCount);
                }
            });
            let models = collection.find(condition,{fields:{_id:1}}).fetch();
            _.each(models,(model)=>{
                idsMap[model._id] = model._id;
            });
            observeWaiting = false;
        }else{
            let idsMap = {};
            let observeWaiting = true;

            observer=collection.find(condition,{skip:count-100}).observeChanges({
                added(_id){
                    let isNew = !idsMap[_id];
                    idsMap[_id] = true;
                    if(isNew&&!observeWaiting){
                        let observeCount = _.size(idsMap);
                        onChanged(observeCount+count-100);
                        if(observeCount>200||observeCount==0){
                            recursive();
                        }
                    }
                },
                removed(_id){
                    delete idsMap[_id];
                    let observeCount = _.size(idsMap);
                    onChanged(observeCount+count-100);
                    if(observeCount>200||observeCount==0){
                        recursive();
                    }
                }
            });

            let models = collection.find(condition,{fields:{_id:1},skip:count-100}).fetch();
            _.each(models,(model)=>{
                idsMap[model._id] = model._id;
            });
            observeWaiting = false;
        }
        currentObserver = observer;
    }

    iteration();

    this.ready();

});