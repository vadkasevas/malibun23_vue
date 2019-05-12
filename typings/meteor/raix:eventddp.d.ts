declare module 'meteor/raix:eventddp' {
    export class EventDDP{
        constructor(name);

        matchEmit(eventName:string,selector:{},message:any):void;
    }
}