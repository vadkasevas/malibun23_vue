import {_} from 'meteor/underscore';
import __ from 'lodash';
//@ts-ignore
import {isset, MalibunCollection, safeGet} from "meteor/malibun23:stack";
import {Meteor} from "meteor/meteor";

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

}