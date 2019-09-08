///<reference path="../typings/meteor/malibun23:stack.d.ts"/>
import {MalibunCollection} from "meteor/malibun23:stack";
//@ts-ignore
import {_} from "meteor/underscore";
//@ts-ignore
import {Meteor} from 'meteor/meteor';

function isPromise(obj) {
    return obj instanceof Promise || (obj && typeof obj.then === 'function');
}

export class VueValidationBuilder {
    validators:Function[]=[];

    constructor(){

    }

    validator(){
        let self = this;
        return function(value,field,model){
            return Promise.all(_.map(self.validators,(validator:Function)=>{
                let validResult = validator.apply(this,[value,field,model]);
                if(isPromise(validResult))
                    return validResult;
                return Promise.resolve(validResult);
            })).then((results)=>{
                return _.flatten(results);
            });
        }
    }

    custom(validator){
        this.validators.push(validator);
        return this;
    }

    unique(collection:MalibunCollection<any>|string,keys:string[]|string|null=null):this{
        //@ts-ignore
        collection = _.isString(collection)?Meteor.connection._stores[collection]._getCollection():collection;
        this.validators.push(function(value,field,model){
            if(!keys)
                keys = field.model;
            if(!_.isArray(keys)) {
                //@ts-ignore
                keys = [keys];
            }

            let condition = {};
            _.each(keys,(key)=>{
                condition[key] = model[key];
            });
            if(model._id){
                condition['_id']={$ne:model._id};
            }
            return new Promise((resolve =>{
                if(Meteor.isClient) {
                    //@ts-ignore
                    Meteor.subscribe(collection._name, condition, () => {
                        resolve();
                    });
                }else {
                    return resolve();
                }
            })).then((resolve)=>{
                //@ts-ignore
                let oldModel = collection.findOne(condition);
                console.log('model:',model);
                console.log('condition:',condition);
                console.log('oldModel:',oldModel);
                if(oldModel){
                    return ['Поле должно быть уникальным'];
                }
                return [];
            });
        });
        return this;
    }

    userId():this{
        this.validators.push(function(value,field,model){
            return (!value||value != this.$userId)?['Недопустимое значение']:[];
        });
        return this;
    }
}