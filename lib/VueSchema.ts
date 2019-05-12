///<reference path="../typings/meteor/meteor.d.ts"/>

import {get,cloneDeep,set} from "lodash";
import {_} from 'meteor/underscore';
//@ts-ignore
import {validators} from 'vue-form-generator';
//@ts-ignore
///<reference path="../typings/meteor/malibun23:stack.d.ts"/>
import {meteorAsync,MalibunCollection} from 'meteor/malibun23:stack';
import {Meteor} from 'meteor/meteor';

interface IGroup{
    legend:string;
    fields:ISchema[];
}
interface ISchema {
    type?:string;
    model?:string;
    validator?:any|Function;
    items?:ISchema[];//array type
    fields?:ISchema[];//base schema
    groups?:IGroup[];//base schema
    schema?:ISchema;//object type
}

interface VueSchemaCtx {
    userId?:string;
}

export class VueSchema{
    model:any;
    schema:ISchema;
    errors:any[];
    ctx:VueSchemaCtx;

    constructor(model,schema,ctx:VueSchemaCtx){
        this.model = model;
        this.schema=schema;
        this.errors = [];
        this.ctx = ctx;
    }

    validate(){
        let promises = [];

        if(this.isProperty){
            if(!this.isVisible){
                if(this.schema.model){
                    //delete this.model[this.schema.model];
                    return;
                }
            }
            this.makeDefault();
            promises.push(this.validateProperty());

            if(this.isArray){
                let arrayValidator = new VueSchema(this.model[this.schema.model],this.schema.items,this.ctx);
                promises.push(arrayValidator.validate());
            }
            if(this.isObject){
                let objectValidator = new VueSchema(this.model[this.schema.model],this.schema.schema,this.ctx);
                promises.push(objectValidator.validate());
            }
        }

        let visibleFields = [];
        let inVisibleFields = [];

        let onField = (field:ISchema)=>{
            let fieldValidator = new VueSchema(this.model,field,this.ctx);
            if(fieldValidator.isVisible) {
                if(field.model&&visibleFields.indexOf(field.model)==-1)
                    visibleFields.push(field.model);
                promises.push(fieldValidator.validate());
            }else{
                if(field.model&&inVisibleFields.indexOf(field.model)==-1)
                    inVisibleFields.push(field.model);
            }
        };

        _.each(this.schema.fields,(field:ISchema)=>{
            onField(field);
        });
        _.each(this.schema.groups,(group:IGroup)=>{
            _.each(group.fields,(field)=>{
                onField(field);
            });
        });

        inVisibleFields = _.difference(inVisibleFields, visibleFields);
        _.each(inVisibleFields,(fieldName)=>{
            delete this.model[fieldName];
        });

        return Promise.all(promises).then((errors)=>{
            if(_.isArray(errors))
                errors = _.compact( _.flatten(errors) );
            return errors;
        });

    }

    makeDefault(){
        let modelField = this.schema['model'];
        if(modelField===undefined)
            return;
        let value = get(this.model,modelField);
        if(value!==undefined)
            return;

        let handler = this.schema['default'];
        if(handler===undefined)
            return;

        let newValue = undefined;
        if (_.isFunction(handler)) {
            newValue = handler.apply(this.ctx,[modelField, this.schema, this.model]);
        } else if (_.isObject(handler) || _.isArray(handler)) {
            newValue = cloneDeep(handler);
        } else
            newValue = handler;
        if(newValue!==undefined)
            set(this.model, modelField, newValue);
    }

    get isProperty():boolean{
        return !!this.schema.type&&!!this.schema.model;
    }

    get isObject(){
        return this.schema['type']=='object';
    }
    get isArray(){
        return this.schema.type=='array';
    }

    get isVisible():boolean{
        let handler = this.schema['visible'];
        if(handler===undefined)
            return true;
        if( _.isFunction(handler)){
            return !!handler(this.model);
        }
        return !!handler;
    }

    get value():any{
        let modelField = this.schema['model'];
        if(!modelField)
            return undefined;
        return this.model[modelField];
    }

    validateProperty() {
        let results = [];
        if(!this.schema.validator)
            return Promise.resolve([]);

        let validators = [];
        if (!_.isArray(this.schema.validator)) {
            validators.push(this.convertValidator(this.schema['validator']));
        } else {
            _.each(this.schema['validator'], validator => {
                validators.push(this.convertValidator(validator));
            });
        }

        _.each(validators, validator => {
            let result = validator.apply(this.ctx,[this.value, this.schema, this.model]);
            if (result && _.isFunction(result.then)) {
                results.push(
                    result.then(err => {
                        if (err) {
                            this.errors = this.errors.concat(err);
                        }
                        return this.errors;
                    })

                );
            } else if (result) {
                results = results.concat(result);
            }
        });


        return Promise.all(results);
    }

    convertValidator(validator) {
        if (_.isString(validator)) {
            if (validators[validator] != null) return validators[validator];
            else {
                console.warn(`'${validator}' is not a validator function!`);
                return null; // caller need to handle null
            }
        }
        return validator;
    }
}


MalibunCollection.prototype['vueMethods'] =function(){
    let collection:MalibunCollection<any>=this;
    Meteor.methods({
        [`vue${this._name}Insert`]:function(doc){
            let userId = Meteor.userId();
            if(Meteor['currentUserId']){
                userId = Meteor.currentUserId(userId);
            }

            var f = Meteor.wrapAsync(function(cb){
                meteorAsync.seqNew([
                    function validate(h,cb){
                        if(!collection.vueSchema)
                            return cb(null,true);
                        let schema = new VueSchema(doc,collection.vueSchema,{
                            userId:userId
                        });
                        schema.validate().then((errors)=>{
                            if(!_.isEmpty(errors)){
                                let err = _.first(errors);
                                if(_.isString(err)){
                                    err = new Meteor.Error(err);
                                }
                                return cb(err);
                            }
                            cb(null,true);
                        }).catch((err)=>{
                            cb(err);
                        });
                    },
                    function checkPermissions(h,cb){
                        if(!collection.permissions )
                            return cb(null,true);
                        let check = collection.permissions.checkInsert(userId,doc);
                        if(!check){
                            return cb(new Meteor.Error('Недостаточно прав'));
                        }
                        cb(null,true);
                    },

                    function insert(h,cb){
                        collection.insert(doc,cb);
                    }
                ]).finally((err,h)=>{
                    return cb(err,h.insert);
                });
            });
            return f();

        },
        [`vue${this._name}Update`]:function(doc){
            let userId = Meteor.userId();
            if(Meteor['currentUserId']){
                userId = Meteor.currentUserId(userId);
            }
            let _id = doc._id;
            var f = Meteor.wrapAsync(function(cb){
                meteorAsync.seqNew([
                    function validate(h,cb){
                        if(!collection.vueSchema)
                            return cb(null,true);
                        let schema = new VueSchema(doc,collection.vueSchema,{
                            userId:userId
                        });
                        schema.validate().then((errors)=>{
                            if(!_.isEmpty(errors)){
                                let err = _.first(errors);
                                if(_.isString(err)){
                                    err = new Meteor.Error(err);
                                }
                                return cb(err);
                            }
                            cb(null,true);
                        }).catch((err)=>{
                            cb(err);
                        });
                    },
                    function checkPermissions(h,cb){
                        delete doc._id;
                        if(!collection.permissions )
                            return cb(null,true);
                        let model=collection.findOne(_id);
                        let check = collection.permissions.checkUpdate(userId,model,{$set:doc});
                        if(!check){
                            return cb(new Meteor.Error('Недостаточно прав'));
                        }
                        cb(null,true);
                    },

                    function update(h,cb){
                        collection.update({_id:_id},{$set:doc},cb);
                    }
                ]).finally((err,h)=>{
                    return cb(err,h.update);
                });
            });
            return f();
        },
    })
}