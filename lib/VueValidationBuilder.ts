///<reference path="../typings/meteor/malibun23:stack.d.ts"/>
import {isset, MalibunCollection, safeGet} from "meteor/malibun23:stack";
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

    static namedAutoComplete(collection,fieldName,schemaOptions,options):any{
        let multiple = safeGet(options,'multiple',false);
        fieldName = fieldName || 'name';
        let collectionName = _.isString(collection)? collection:collection._name;

        var getCollection = function(){
            //@ts-ignore
            return MalibunCollection.byName(collectionName);
        };
        var methodName = `${collectionName}namedAutoComplete`;
        if(safeGet(options,'multiple',false)){
            methodName+='Multiple';
        }
        var limit = safeGet(options,'limit',0);
        if(limit){
            methodName+=`Limit${limit}`;
        }
        var methodFunction = null;
        if(_.isString(safeGet(options,'method',methodName) )){
            methodName = safeGet(options,'method',methodName);
        }else{
            methodFunction = safeGet(options,'method',null);
        }
        methodName = safeGet(options,'method',methodName);

        var transform = safeGet(options,'transform',function (model) {
            return {label: safeGet( model,fieldName,''), value: model._id};
        });

        if(Meteor.isServer){
            //@ts-ignore
            if(!isset(Meteor.default_server.method_handlers[methodName])) {
                var method = {};
                method[methodName] = methodFunction || function (options) {
                    let collection = getCollection();
                    this.unblock();
                    var findOptions = limit ? {limit:limit} : {};
                    var condition = options.searchText ? {$or : [{ [fieldName]: {$regex:new RegExp(options.searchText, "i") }} ] } : {};
                    //console.log(condition);
                    if(options.values&&options.values.length>0) {
                        condition.$or = condition.$or || [];
                        //@ts-ignore
                        condition.$or.push( { _id:{ $in: options.values} } );
                        if(limit)
                            findOptions = {limit:limit+options.values.length};
                    }

                    //@ts-ignore
                    var cursor = (collection instanceof MalibunCollection && !Meteor.isAdmin() ) ?  collection.publishCursor( Meteor.currentUser(), condition, options )
                        :collection.find(condition,findOptions);

                    return cursor.fetch().map(function (model) {
                        return transform(model);
                    });
                };
                Meteor.methods(method);
            }
        }


        schemaOptions['type'] = 'autocomplete';
        schemaOptions['multiple'] = !!multiple;
        schemaOptions['methodName'] = methodName;
        return schemaOptions;
    }

    userId():this{
        this.validators.push(function(value,field,model){
            return (!value||value != this.$userId)?['Недопустимое значение']:[];
        });
        return this;
    }
}