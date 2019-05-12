import {MalibunCollection,capitalize,firstLower} from "meteor/malibun23:stack";
import { RouterFactory,nativeScrollBehavior } from 'meteor/akryum:vue-router2';
import {_} from 'meteor/underscore';
import {PageTitleMixin} from 'meteor/malibun23:vue';
import {Meteor} from 'meteor/meteor';

const action = function(target, key, descriptor) {
    descriptor.writable = false;
    target.actions = target.actions || ['actionIndex','actionCreate','actionUpdate','actionView'];
    if(target.actions.indexOf(key)==-1){
        target.actions.push(key);
    }
    return descriptor;
};
export {action};

export interface RouterConfig {
    path:string;
    name:string;
    component:any;
    props?:any;
    methods?:any;
    title?:string|(() => string)|(() => Promise<string>);
    meta?:any;
}
/**
 * @property {MalibunCollection} collection - коллекция
 */
export class VueController{
    collection?:MalibunCollection<any>;
    actions:string[];

    constructor(collection){
        this.collection = collection;
        this.actions = this.actions || ['actionIndex','actionCreate','actionUpdate','actionView'];
    }

    static router(){
        const routerFactory = new RouterFactory({
            mode: 'history',
            scrollBehavior: nativeScrollBehavior
        });
        return routerFactory.create();
    }

    get name(){
        return this.collection?this.collection._name:'?';
    }
    getActionName(action){
        if(typeof action=='function'){
            action = action.name;
            action = action.replace(/^action/gi,'');
        }
        action = capitalize(action);
        return this.name+action;
    }

    getPath(action, urlParams:any[]=[]){
        if(typeof action=='function'){
            action = action.name;
            action = action.replace(/^action/gi,'');
        }
        action = firstLower(action);
        urlParams = _.isArray(urlParams) ? urlParams : _.toArray(arguments).slice(1);

        var route = urlParams.length>0 ? `/${this.name}/${action}/`+urlParams.join('/') : `/${this.name}/${action}`;
        return route;
    }

    init(){
        var controller = this;
        _.each(this.actions,(actionName)=>{
            var f = this[actionName];
            if(f&&typeof f=='function') {
                var action = f.apply(controller);
                if (action && action instanceof VueAction) {
                    action.controller = controller;
                    // console.log(action.route,action.serialize());

                    action.init();
                    /*
                    if (Meteor.isClient) {
                        if (action.hooks)
                            AutoForm.hooks(action.hooks);

                        if (action.events) {
                            for (var templateName in action.events) {
                                Template[templateName].events(action.events[templateName]);
                            }
                        }

                        if (action.helpers) {
                            _.each(action.helpers, function (_helpers, templateName) {
                                Template[templateName].helpers(_helpers);
                            });
                        }
                    }*/
                }
            }
        });



    }
    /** @returns {MalibunController.MalibunAction}*/

    actionIndex(){
        var controller = this;

        return new VueAction({
            path:this.getPath('index'),
            name:this.getActionName('index'),
            component:null,
            title:function(){
                return `Просмотр моделей `;
            }
        });
    }

    /** @returns {MalibunController.MalibunAction}*/

    actionView(){
        var controller = this;
        return new VueAction({
            component:null,
            path:this.getPath('view',[':_id']),
            name:this.getActionName('view'),
            title:function(){
                return `Просмотр модели "{model.name}"`;
            }
        });
    }

    /** @returns {MalibunController.MalibunAction}*/
    actionUpdate(){
        var controller = this;
        return new VueAction({
            path:this.getPath('update',[':_id']),
            name:this.getActionName('update'),
            component:null,
            title:`Изменить модель "{model.name}"`
        });
    }

    /** @returns {MalibunController.MalibunAction}*/
    actionCreate(){
        var controller = this;
        return new VueAction({
            path:this.getPath('create'),
            name:this.getActionName('create'),
            component:null,
            title:function(){
                return `Создать новый ${controller.collection._name}`;
            }
        });
    }



};

export class VueAction implements RouterConfig{
    static baseTitle?:string;
    static current?:VueAction;

    path:string;
    name:string;
    component:any;
    props?:any;
    controller?:VueController;
    methods?:any;
    title?:string|(() => string)|(() => Promise<string>);
    meta?:any;

    constructor(opts:RouterConfig) {
        this.extends(opts);
    }

    extends(newOpts:RouterConfig):this{
        if(newOpts.path)
            this.path = newOpts.path;
        if(newOpts.name)
            this.name = newOpts.name;
        if(newOpts.component)
            this.component = newOpts.component;
        if(newOpts.props)
            this.props = newOpts.props;
        if(newOpts.title)
            this.title = newOpts.title;
        if(newOpts.meta)
            this.meta = newOpts.meta;
/*
        if(isset(newOpts.parent))
            this.parent = newOpts.parent;

        if(newOpts.waitOn) {
            if(_.isArray(newOpts.waitOn))
                this.waitOn = function(){ return newOpts.waitOn };
            else
                this.waitOn = newOpts.waitOn;
        }
        if(newOpts.data)
            this.data = newOpts.data;
        if(newOpts.name)
            this.name = newOpts.name;
        if(newOpts.hooks)
            this.hooks = newOpts.hooks;
        if(newOpts.events)
            this.events = newOpts.events;
        if(newOpts.helpers)
            this.helpers = newOpts.helpers;
        if(newOpts.methods)
            this.methods = newOpts.methods;
        if(newOpts.onBeforeAction)
            this.onBeforeAction = newOpts.onBeforeAction;
        if(newOpts.rendered&&Meteor.isClient){
            Template[action.template].onRendered(newOpts.rendered);
        }

        if(newOpts.title) {
            this.title = function(){
                this.router.options.noCaps = true;
                var data = this.data();
                var result = typeof(newOpts.title)=='string' ? newOpts.title:newOpts.title.apply(this,[data]);
                var tmpResult = result;
                var params = this.params;
                var matches;
                var re = /:([^\s"',;:]+)|\{([^\}]+)\}/gi;
                while ((matches = re.exec(result)) != null){
                    var replacement = matches[0];
                    var search = matches[1] || matches[2];
                    var val = safeGet(params,search,safeGet(data,search,''));
                    if(val)
                        tmpResult = tmpResult.replace(new RegExp(replacement, 'g'), val );
                }
                return tmpResult;
            };
        }

        if(newOpts.onAfterAction)
            this._onAfterAction = newOpts.onAfterAction;

        if(this.title||this._onAfterAction) {
            this.onAfterAction = function () {
                if (action.title) {
                    var title =  MalibunController.MalibunAction.baseTitle+ action.title.apply(this) ;

                    Meteor.startup(function(){
                        Deps.autorun(function () {
                            document.title = title;
                        });
                    });
                }
                if (action._onAfterAction) {
                    action._onAfterAction.apply(this);
                }
            };
        }
*/

        return this;
    }

    serialize():RouterConfig{
        var result:RouterConfig = {
            path : this.path,
            name:this.name,
            component:{
                extends:this.component,
                mixins: [PageTitleMixin]
            },
            meta:this.meta
        };
        if(this.props)
            result.props = this.props;
        if(this.methods)
            result.methods = this.methods;
        result['meta'] = result['meta']||{};
        if(this.title) {
            result['meta']['title'] = this.title;
        }
        return result;
        /*
        if(this.template)
            result.template = this.template;
        if(this.parent)
            result.parent = this.parent;
        if(this.waitOn){
            var waitOn = _.isArray(this.waitOn) ? ()=>{return this.waitOn;} : this.waitOn;
            result.waitOn = waitOn;
        }
        if(this.data)
            result.data = function(){
                var data = self.data.apply(this,arguments);
                if(MalibunAction.data) {
                    _.each(data, function (val, key) {
                        MalibunAction.data[key] = val;
                        MalibunAction.data[`${key}Reactive`] = new ReactiveVar(val);
                    });
                }
                return data;
            }
        if(this.name)
            result.name = this.name;

        if(this.onAfterAction)
            result.onAfterAction = this.onAfterAction;
        if(this.title)
            result.title = this.title;
        result.noCaps = true;
        if(this.onBeforeAction)
            result.onBeforeAction = this.onBeforeAction;
        result.onBeforeAction = function(pause){
            MalibunController.current = self.controller;
            MalibunAction.current = self;
            MalibunAction.data = {};
            this.next();
        };
        return result;
        */
    }

    init(){
        console.log('this.serialize():',this.serialize());
        RouterFactory.configure(factory => {
            factory.addRoutes([
                this.serialize()
            ]);
        });
        if (Meteor.isServer) {
            if (this.methods) {
                Meteor.methods(this.methods);
            }
        }
    }
};

VueAction.baseTitle = 'КИК | ';
VueAction.current = null;

