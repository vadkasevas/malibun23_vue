import {MalibunCollection, MalibunModel} from "meteor/malibun23:stack";
import {CollectionTracker} from "./CollectionTracker";

var action = function(target, key, descriptor) {
    descriptor.writable = false;
    target.actions = target.actions || ['actionIndex','actionCreate','actionUpdate','actionView'];
    if(target.actions.indexOf(key)==-1){
        target.actions.push(key);
    }
    return descriptor;
};

export class SingleModelVueComponent<T>{
    actions=[];
    collection:MalibunCollection<T>=null;
    model:MalibunModel<T>=null;

    constructor(collection:MalibunCollection<T>){
        this.collection = collection;
    }

    data(){
        return {
            model:this.model
        }
    }

    beforeRouteEnter (to, from, next) {
        let tracker = new CollectionTracker(this.collection);
        tracker.subscribe({})
            .ready(()=>{
                next((vm)=>{
                    vm.model = this.collection.findOne();
                    tracker.autorun(()=>{
                        vm.model = this.collection.findOne();
                    });
                });
            })
        console.log('beforeRouteEnter');
    }
}

