declare module 'meteor/meteor' {
    module Meteor{
        interface Connection {
            _stores:object;
            registerStore(name:string,handlers:object):object;
        }
        export const isServer:Boolean;
        export const connection:Meteor.Connection;

        export function afterStartup(func: Function): void;
        export function beforeStartup(func: Function): void;
        export function userIsInRole(userId:string,role:string):Boolean;
        export function userIdIsAdmin(userId:string):Boolean;
        export function userIdIsCompany(userId:string):Boolean;
        export function isAdmin(userId?:string):Boolean;
        export function isCompany():Boolean;
        export function currentUserId(userId?:string):string;
        export function currentUser(userId?:string):Meteor.User;

        export function subscribe(collectionName: any | MalibunCollection<T> | MalibunCollection<T> | MalibunCollection<T> | Mongo.Collection<any> | Mongo.Collection<FileObj>, param2: {_id: any}, param3: () => void);
        export function userId();

        export function wrapAsync(param: (cb) => void);

        export function methods(param: { [p: string]: ((doc) => any) | ((doc) => any) });
    }
}

declare module 'meteor/minimongo'{
    module Minimongo{
        export class Matcher{
            constructor(selector:any);
            documentMatches(doc:object):boolean;
        }
    }
}