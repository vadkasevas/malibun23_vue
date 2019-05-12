declare module "meteor/mongo"{
    module Mongo{
        export interface CollectionStatic{
            getDriverByUrl(MONGO_URL: string, OPLOG_URL?: string): Mongo.Cursor<any>;
        }
        export interface Collection<T> {
            _name:string;
            _defineBatchInsert():any;
            attachSchema(schema:SimpleSchema,options?:{replace:boolean});
        }
        export class ObjectID {
            _str: string;
        }
    }
}

declare module 'meteor/malibun23:stack' {
    import EventEmitter from 'events';
    import {Mongo} from 'meteor/mongo';
    import {SimpleSchema} from 'meteor/aldeed:simple-schema';
    import * as urlParser from 'url';

    class MalibunEnumItem {
        key: string;
        label: string;

        constructor(key: string, label: string);

        valueOf(): string;

        toString(): String;
    }

    export class MalibunEnum{
        constructor(data: any);

        toSimpleSchema(options?: any): SimpleSchema;

        first(): MalibunEnumItem;

        exclude(keys: any): MalibunEnuma
    }

    interface IPermissionsCheck {
        allowed:boolean;
        disallowedFields:string[];
        allowedFields:string[];
    }
    export class CollectionPermissions{
        constructor(collection,permissions);
        checkData(data:string,p):IPermissionsCheck;
        checkDoc(doc,data,p):boolean;
        checkInsert(userId:string,doc:any):boolean;
        checkUpdate(userId:string,doc:any,modifier:any):boolean;
        checkRemove(userId:string,doc:any):boolean;
        findCondition(userId):any;
    }

    export class MalibunCollection<T> extends Mongo.Collection<T> {
        _name:string;
        static emitter: EventEmitter;
        _options: object;
        permissions: CollectionPermissions;
        schema: SimpleSchema;
        _schema: SimpleSchema;
        ready: boolean;

        constructor(name:string,options:{
            modelClass:any,
            permissions:any
        })

        static byName(name:string):MalibunCollection<any>;

        _defineBatchInsert(): any;

        subscribe(selector: Selector<T> | ObjectID | string): Meteor.SubscriptionHandle;

        byPk(id: string): T;

        insertAndGet(T): T;

        publishCursor(userId: string, condition: Selector<T> | ObjectID | string, options?: object): Cursor<T>;

        userAuth(pagination: any, skip?: number, sub?: Meteor.SubscriptionHandle): Cursor<T>;

        adminAuth(pagination: any, skip?: number, sub?: Meteor.SubscriptionHandle): Cursor<T>;

        auth(userId: string, condition?: Selector<T>, options?: object): Cursor<T>;

        labels(fields: string[]): string[];

        static ready(names: string | string[], cb: Function): void;

        vueMethods():void;
        vueSchema:any;
    }

    export class MalibunModel<T> {
        _id?: string;
        collection?: MalibunCollection<T>;

        update(update: string[] | T | string | object): number;

        remove(): number;
    }

    export class HttpClient{
        constructor(url:string);
        static urlParser:typeof urlParser;
        static forOptions(options:{
            url:string,
            clientClass?:any,
            headers?:string[]|object,
            cookies?:any,
            proxy?:any,
            httpMethod?:string,
            postData?:any,
            formContentType?:string,
            followLocation?:boolean,
            timeout?:number,
            gzip?:boolean,
            keepAlive?:boolean,
            encoding?:string|null,
            referer?:string,
            getParams?:object,
        }):HttpClient;

        execute():{
            then(err:Error|null,content:{content?:string,statusCode:number}|null);
        }
    }

    interface IMalibunStorage {
        ensureDir(file:string):string;
    }
    export const MalibunStorage:IMalibunStorage;

    export class MalibunPromise {
        constructor(fun:Function);
        then(onResolved:Function, onRejected:Function):MalibunPromise;
        catch(onRejected:Function):MalibunPromise;
        resolve(result1:any,result2?:any,result3?:any):void;
        reject(err:Error,result?:any):void;
        finally(cb:Function,ctx?:any):MalibunPromise;
        sync();
        isResolved():Boolean;
        static resolve(result1:any):MalibunPromise;
        static reject(err:Error):MalibunPromise;
        static isPromise(obj:any):Boolean;
    }

    export function clearHelperArguments(): any;

    export function combineClasses(baseClass, ...mixins): any;

    export function extend(deep: boolean, target: object, source: object): object;

    export function md5(s: string): string;

    export function getRandHash(): string;

    export function stringify(obj: object): string;

    export function inArray(arr: any[], needle: any): Boolean;

    export function isset(obj: any): Boolean;

    export function objectSize(obj: object): number;

    export function firstKey(obj: object): number | string;

    export function randKey(object: object | any[]): number | string;

    export function randValue(object: object | any[]): any;

    export function randArrValue(arr: any[]): any;

    export function eachObjectField(obj: any, callback: Function): void;

    export function generateRandomHash():string;

    export function formatRuBoolean(val:Boolean):string;

    export function safeGet (obj:any, props:string|string[], defaultValue?:any):any;

    export function deserializeDate(dateS:string):Date;

    export function keyValueChunks(objOrArray:object|any[],key:string,size:number):any[];

    export function formatRuDate(date?:Date):string;



}