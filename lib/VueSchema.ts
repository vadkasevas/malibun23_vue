///<reference path="../typings/meteor/meteor.d.ts"/>

import {get,cloneDeep,set} from "lodash";
import {_} from 'meteor/underscore';
//@ts-ignore
import {validators} from './MeteorVueFormGenerator/index';
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
    $userId?:string;
    $parentModel?:object;
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

    genChildCtx(){
        let result = {};
        let $userId = this.ctx.$userId;
        Object.defineProperty(result, '$userId', {
            get: function() {
                return $userId;
            }
        });
        let $parentModel = this.model;
        Object.defineProperty(result, '$parentModel', {
            get: function() {
                return $parentModel;
            }
        });
        return result;
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
                let arrayValidator = new VueSchema(this.model[this.schema.model],this.schema.items,this.genChildCtx());
                promises.push(arrayValidator.validate());
            }
            if(this.isObject){
                let objectValidator = new VueSchema(this.model[this.schema.model],this.schema.schema,this.genChildCtx());
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
            let field = this.schema;
            let errs = validator.apply(this.ctx,[this.value, field, this.model]);
            function cathErrors(errs){
                if(!_.isEmpty(errs)){
                    let result = _.chain(errs)
                        .map((err)=>{
                            return {
                                error:err,
                                field:field
                            }
                        })
                        .value();
                    return result;
                }
            }
            if (errs && _.isFunction(errs.then)) {
                results.push(
                    errs.then(errs => {
                        if (errs) {
                            this.errors = this.errors.concat(cathErrors(errs));
                        }
                        return this.errors;
                    })
                );
            } else if (errs) {
                results = results.concat(cathErrors(errs));
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
            let $userId = Meteor.userId();
            if(Meteor['currentUserId']){
                $userId = Meteor.currentUserId($userId);
            }

            function genCtx(){
                let result = {};
                Object.defineProperty(result, '$userId', {
                    get: function() {
                        return $userId;
                    }
                });
                Object.defineProperty(result, '$parentModel', {
                    get: function() {
                        return null;
                    }
                });
                return result;
            }

            let f = Meteor.wrapAsync(function(cb){
                meteorAsync.seqNew([
                    function validate(h,cb){
                        if(!collection.vueSchema)
                            return cb(null,true);
                        let schema = new VueSchema(doc,collection.vueSchema,genCtx());
                        schema.validate().then((errors)=>{
                            if(!_.isEmpty(errors)){
                                let err = _.first(errors);
                                console.log(err);
                                //@ts-ignore
                                err = new Meteor.Error(err.error,err.error,err.field&&err.field.model?err.field.model:JSON.stringify(err.field));
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
                        let check = collection.permissions.checkInsert($userId,doc);
                        if(!check){
                            return cb(new Meteor.Error('Недостаточно прав'));
                        }
                        cb(null,true);
                    },

                    function beforeHooks(h,cb){
                        if(collection.vueSchema.before&&collection.vueSchema.before.save){
                            collection.vueSchema.before.save.apply(genCtx(),[doc]);
                        }
                        if(collection.vueSchema.before&&collection.vueSchema.before.insert){
                            collection.vueSchema.before.insert.apply(genCtx(),[doc]);
                        }
                        cb();
                    },
                    function insert(h,cb){
                        collection.insert(doc,cb);
                    },
                    function afterHooks(h,cb){
                        if(collection.vueSchema.after&&collection.vueSchema.after.save){
                            collection.vueSchema.before.save.apply(genCtx(),[h.insert,doc]);
                        }
                        if(collection.vueSchema.before&&collection.vueSchema.after.insert){
                            collection.vueSchema.before.insert.apply(genCtx(),[h.insert,doc]);
                        }
                        cb();
                    },
                ]).finally((err,h)=>{
                    return cb(err,h.insert);
                });
            });
            return f();

        },
        [`vue${this._name}Update`]:function(doc){
            let $userId = Meteor.userId();
            if(Meteor['currentUserId']){
                $userId = Meteor.currentUserId($userId);
            }
            function genCtx(){
                let result = {};
                Object.defineProperty(result, '$userId', {
                    get: function() {
                        return $userId;
                    }
                });
                Object.defineProperty(result, '$parentModel', {
                    get: function() {
                        return null;
                    }
                });
                return result;
            }
            let _id = doc._id;
            let f = Meteor.wrapAsync(function(cb){
                meteorAsync.seqNew([
                    function validate(h,cb){
                        if(!collection.vueSchema)
                            return cb(null,true);
                        let schema = new VueSchema(doc,collection.vueSchema,genCtx());
                        schema.validate().then((errors)=>{
                            if(!_.isEmpty(errors)){
                                let err = _.first(errors);
                                console.log(err);
                                //@ts-ignore
                                err = new Meteor.Error(err.error,err.error,err.field&&err.field.model?err.field.model:JSON.stringify(err.field));
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
                        let check = collection.permissions.checkUpdate($userId,model,{$set:doc});
                        if(!check){
                            return cb(new Meteor.Error('Недостаточно прав'));
                        }
                        cb(null,true);
                    },

                    function beforeHooks(h,cb){
                        if(collection.vueSchema.before&&collection.vueSchema.before.save){
                            collection.vueSchema.before.save.apply(genCtx(),[doc]);
                        }
                        if(collection.vueSchema.before&&collection.vueSchema.before.update){
                            collection.vueSchema.before.insert.apply(genCtx(),[doc]);
                        }
                        cb();
                    },

                    function update(h,cb){
                        collection.update({_id:_id},{$set:doc},cb);
                    },

                    function afterHooks(h,cb){
                        if(collection.vueSchema.after&&collection.vueSchema.after.save){
                            collection.vueSchema.after.save.apply(genCtx(),[doc]);
                        }
                        if(collection.vueSchema.after&&collection.vueSchema.after.update){
                            collection.vueSchema.after.update.apply(genCtx(),[doc]);
                        }
                        cb();
                    },
                ]).finally((err,h)=>{
                    return cb(err,h.update);
                });
            });
            return f();
        },
    })
};