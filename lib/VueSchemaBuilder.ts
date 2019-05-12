import {_} from 'meteor/underscore';
import __ from 'lodash';
import {isset, MalibunCollection, safeGet} from "meteor/malibun23:stack";

export class VueSchemaBuilder{
    vueSchema:any;

    constructor(vueSchema:any){
        this.vueSchema = __.cloneDeep( vueSchema );
    }

    withFields(fields:any|any[]):this{
        if(!_.isArray(fields))
            fields=[fields];
        this.vueSchema.fields = this.vueSchema.fields || [];
        _.each(fields,(field)=>{
            this.vueSchema.fields.push(field);
        });
        return this;
    }

    build():any{
        return __.cloneDeep( this.vueSchema );
    }

    static namedAutoComplete(collection,fieldName,schemaOptions,options):any{
        let multiple = safeGet(options,'multiple',false);
        fieldName = fieldName || 'name';
        var getCollection = function(){
            return collection;
        };
        var methodName = (typeof collection=='string') ? `${collection}namedAutoComplete` : `${collection._name}namedAutoComplete`;
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


        schemaOptions['type'] = multiple ? 'autocompleMultiple' : 'autocomple';
        schemaOptions['methodName'] = methodName;
        return schemaOptions;
    }

};