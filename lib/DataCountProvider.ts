import {DataProvider} from "./DataProvider";
import {MalibunCollection, MalibunModel} from 'meteor/malibun23:stack';
import {_} from 'meteor/underscore';

export class DataCountProvider extends DataProvider<any>{
    constructor(collection:MalibunCollection<any>){
        super(collection);
        this.subscriptionName = 'dataProviderCount';
    }

    get count():number{
        let model = _.first(this.models);
        return model?model.count:0;
    }

    autorun(cb:(count:number)=>void):this{
        this.ready(()=>{
            let model = _.first(this.models);
            if(model){
                cb(this.count);
            }
            this.on('change',()=>{
                cb(this.count);
            });
        });
        return this;
    }

    change(){
        console.log('changeQueued:',this.changeQueued);
        super.change();
    }
}