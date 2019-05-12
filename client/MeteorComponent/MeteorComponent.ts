import {Vue, Component,Prop,Inject,Watch,Emit} from 'vue-property-decorator';
import {CollectionTracker} from "./CollectionTracker";
import {MalibunCollection, MalibunModel} from "meteor/malibun23:stack";
import {_} from 'meteor/underscore';

Component.registerHooks([
    'beforeRouteEnter',
    'beforeRouteLeave',
    'beforeRouteUpdate' // for vue-router 2.2+
]);

@Component
export class MeteorComponent<T> extends Vue{
    @Prop() collection!: any;
    trackers:CollectionTracker<T>[]=[];
    ready:boolean=false;

    created(){
        console.log('MeteorComponent created');
    }

    @Watch('$route', { immediate: true, deep: true })
    onRouteChanged(newRoute,oldRoute){
        console.log('newRoute:',newRoute);
        console.log('oldRoute:',oldRoute);
        // @ts-ignore
        console.log('this.$route:',this.$route);
        this._subscribe();
    }

    _subscribe(){
        this.unsubscribe();
        var trackers = this.subsribe();
        if(!trackers) {
            return this.ready=true;
        }
        if(!_.isArray(trackers)){
            trackers = [trackers];
        }
        this.trackers = trackers;
        if(_.isEmpty(this.trackers)){
            return this.ready=true;
        }

        _.each(this.trackers,(tracker)=>{
            tracker.ready(()=>{
                let notReady = _.find(this.trackers,(tracker)=>{
                    return !tracker.isReady;
                });
                this.ready=!notReady;
            });
        });
    }

    /*subsribe():CollectionTracker<any>[]|CollectionTracker<any>|void{
        console.error('subscribe должен быть переопределен');
    }*/
    unsubscribe(){
        _.each(this.trackers,(tracker:CollectionTracker<T>)=>{
            tracker.stop();
        });
        this.trackers=[];
    }

    beforeRouteEnter (to, from, next) {
        console.log(to);
        console.log('beforeRouteEnter')
        next()
    }
    beforeRouteUpdate (to, from, next) {
        console.log('beforeRouteUpdate');
        next();
    }

    beforeRouteLeave (to, from, next) {
        this.unsubscribe();
        next();
    }



}