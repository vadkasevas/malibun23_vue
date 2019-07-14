// @ts-ignore
import Vuetify from 'vuetify'
import Vue from 'vue';
// @ts-ignore
import ru from 'vuetify/es5/locale/ru'
//import async from 'async';
// @ts-ignore
import async = require("async")
// @ts-ignore
import hashMaker from 'object-hash';
import {Meteor} from "meteor/meteor";

// @ts-ignore
import colors from 'vuetify/es5/util/colors'
Vue.use(Vuetify, {
    lang: {
        locales: { ru },
        current: 'ru'
    },
    theme: false
});

import {MalibunCollection, MalibunModel} from 'meteor/malibun23:stack';
import {DataProvider} from "../../lib/DataProvider";
// @ts-ignore
import { EJSON } from 'meteor/ejson'
import {DataCountProvider} from "../../lib/DataCountProvider";
// @ts-ignore
import {_} from 'meteor/underscore';
import 'vuetify/dist/vuetify.min.css'//TODO
//import './materialIncons.css';
// @ts-ignore
import {Component,Prop,Watch} from 'vue-property-decorator'


interface IPagination {
    sortBy?:string;
    descending?:boolean;
    page:number;
    rowsPerPage:number;
    totalItems:number;
    rowsPerPageItems:number[];
    selector:{};
}
class PaginationDataProvider extends DataProvider<MalibunModel<any>>{
    pageSize:number=null;
    $sort:{};
    toPage:number;
    fromPage:number;
}

enum SearchOptions{
    number='number',
    string='string',
    true='true'
}
@Component
export class VuetifyPagination extends Vue{
    SearchOptions=SearchOptions;

    @Prop({ default: 10 })
    initialPageSize:number;

    @Prop({required: true}) readonly collection:any;
    @Prop({default:()=>{return {} }}) readonly initSelector:{};
    @Prop({default:()=>{return {} }}) readonly initSelectorOptions:{};
    @Prop({default:()=>{return [] }}) readonly searchFields:string[];

    isReady:boolean=false;
    models:any[]=[];
    totalCount:number=0;
    dataProvider:PaginationDataProvider=null;
    search:string='';
    subscriptionName:string='';

    pagination:IPagination={
        descending: true,
        page: 1,
        rowsPerPage: this.initialPageSize,
        sortBy: 'index',
        totalItems: 0,
        rowsPerPageItems: [10,20,50,100],
        selector:null
    };
    countProvider:DataCountProvider=null;
    userSelector:null;

    @Prop({required: true})
    readonly headers:{}[];

    @Watch('initSelector')
    onInitSelectorChange(){
        this.onChange();
    }

    @Watch('pagination',{deep: true })
    onPaginationChange($pagination){
        this.onChange();
    }

    @Watch('search')
    onSearchChange(){
        this.onChange();
    }

    ready(cb){
        if(this.isReady)
            return cb();
        else{
            this.$once('ready',cb);
        }
    }

    onChange(){
        let dataProvider = this.dataProvider;
        let selector = EJSON.parse( EJSON.stringify(this.selector));
        if(!dataProvider||dataProvider.pageSize!=this.pageSize
            ||this.currentPage<dataProvider.fromPage
            ||this.currentPage>dataProvider.toPage
            ||EJSON.stringify(dataProvider.$sort)!=EJSON.stringify(this.$sort)
            ||EJSON.stringify(this.pagination.selector)!=EJSON.stringify(selector)
        ){
            this.pagination.selector = selector;
            this.isReady = false;
            async.parallel({
                dataProvider:(cb)=>{
                    if(dataProvider)
                        dataProvider.stop();
                    this.dataProvider = this.createDataProvider();
                    this.dataProvider.ready(()=>{
                        cb();
                    });
                },
                countProvider:(cb)=>{
                    if(this.countProvider&&this.countProvider['hash']!=hashMaker(selector)){
                        this.countProvider.stop();
                        this.countProvider = null;
                    }
                    if(this.countProvider){
                        return cb();
                    }
                    let collectionName = _.isString(this.collection)?this.collection:this.collection._name;
                    let collection = Meteor['connection']._stores[collectionName]._getCollection();
                    this.countProvider = new DataCountProvider(collection);
                    this.countProvider.subscribe(selector);
                    this.countProvider['hash'] = hashMaker(selector);
                    this.countProvider.autorun((count)=>{
                        this.totalCount=count;
                    });
                    this.countProvider.ready(()=>{
                        cb();
                    });
                }
            }, ()=>{
                this.isReady=true;
                this.$emit('ready');
            });


        }else{
            let start = (this.currentPage-this.dataProvider.fromPage) * this.pageSize;
            console.log(`start (${start}) = (${this.currentPage}-${this.dataProvider.fromPage}) * ${this.pageSize};`)
            let end = start + this.pageSize;
            this.models = this.dataProvider.models.slice(start,end);
            console.log(`this.models (${this.models.length}) = this.dataProvider.models.slice(start${start},end(${end}));`)
        }
    }

    get hasSearchFields(){
        return !!_.find(this.headers,(header)=>{
            return !!header['search'];
        });
    }

    get selector(){
        let $and = [],$or = [];
        if(!_.isEmpty(this.initSelector)){
            console.log('this.initSelector:',this.initSelector);
            $and.push(EJSON.clone(this.initSelector));
        }
        if(!_.isEmpty(this.userSelector)){
            console.log('this.userSelector:',this.userSelector);
            $and.push(EJSON.clone(this.userSelector));
        }
        let search = this.search?String(this.search):'';
        if(search&&this.hasSearchFields){
            _.each(this.headers,(header)=>{
                if(!header['search'])
                    return;
                if( header['search']==SearchOptions.string||header['search']==SearchOptions.true ){
                    $or.push({ [header['value']]: {$regex:search, $options: '-i'} })
                }
                if( header['search']==SearchOptions.number||header['search']==SearchOptions.true ) {
                    var num = Number(search);
                    if (!_.isNaN(num)) {
                        $or.push({[header['value']]: num});
                    }
                }
            });
        }
        let selector =  {};
        if(!_.isEmpty($and)){
            selector['$and']=$and;
        }
        if(!_.isEmpty($or)){
            selector['$or']=$or;
        }
        /*if(!this.pagination.selector || EJSON.stringify(this.pagination.selector)!=EJSON.stringify(selector) ){
            this.pagination.selector = selector;
        }*/
        return selector;
    }

    get $sort(){
        return this.pagination.sortBy?{[this.pagination.sortBy]:this.pagination.descending?-1:1}:null;
    }
    get currentPage(){
        return this.pagination.page;
    }
    get pageSize(){
        return Number( this.pagination.rowsPerPage );
    }
    get items() {
        return this.models;
    }
    mounted() {
        this.$nextTick(()=>{
            this.isReady = false;
            this.onChange();
        })
    }

    createDataProvider(){
        let currentPage = this.currentPage;//3
        let cachedPages = 10;
        let $sort = EJSON.parse (EJSON.stringify (this.$sort));
        let selectOptions = {};
        if($sort){
            selectOptions['sort'] = $sort;
        }
        selectOptions['limit'] = this.pageSize * cachedPages;//20
        let fromPage = (currentPage - Math.ceil (cachedPages / 2));//3-1=2
        if(fromPage<1)
            fromPage=1;
        let toPage = fromPage+cachedPages-1;//2+2-1=3
        selectOptions['skip'] = (fromPage - 1) * this.pageSize;//11-10 = 10???
        if (selectOptions['skip'] < 0)
            selectOptions['skip'] = 0;
        let collectionName = _.isString(this.collection)?this.collection:this.collection._name;
        let collection = Meteor['connection']._stores[collectionName]._getCollection();

        let dataProvider = new PaginationDataProvider(collection,this.subscriptionName||collectionName);

        dataProvider.subscribe (this.selector, selectOptions);
        dataProvider['fromPage'] = fromPage;//2
        dataProvider['toPage'] = toPage;//3
        dataProvider['pageSize'] = this.pageSize;
        dataProvider['$sort'] = EJSON.parse (EJSON.stringify (this.$sort));
        this.isReady = false;
        dataProvider.autorun(()=>{
            let start = (this.currentPage-this.dataProvider.fromPage) * this.pageSize;//3-2
            let end = start + this.pageSize;
            let models = _.sortBy(this.dataProvider.models,(model)=>{
                if(!this.pagination.sortBy)
                    return 0;
                return model[this.pagination.sortBy];
            });
            /*if(this.pagination.descending){
                models = models.reverse();
            }*/
            this.models = models.slice(start,end);
        });
        return dataProvider;
    };
}