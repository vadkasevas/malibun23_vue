// Type definitions for iron:router.
// Project: https://atmospherejs.com/iron/router
// Definitions by:
// Dave Allen <https://github.com/fullflavedave>

declare module 'meteor/iron:router' {

    interface TemplateConfig {
        to?: string;
        waitOn?: boolean;
        data?: boolean;
    }

    interface TemplateConfigDico {
        [id: string]: TemplateConfig
    }

    interface GlobalConfig {
        load?: Function;
        autoRender?: boolean;
        layoutTemplate?: string;
        notFoundTemplate?: string;
        loadingTemplate?: string;
        waitOn?: any;
    }

    interface MapConfig {
        path?: string;
        // By default template is the route name, this field is the override.
        template?: string;
        layoutTemplate?: string;
        yieldTemplates?: TemplateConfigDico;
        // Can be a Function or an object literal {}.
        data?: any;
        /**
         * WaitOn can be a subscription handle, an array of subscription
         * handles or a function that returns a subscription handle
         * or array of subscription handles. A subscription handle is
         * what gets returned when you call Meteor.subscribe
         */
        waitOn?: any;
        loadingTemplate?: string;
        notFoundTemplate?: string;
        controller?: RouteController;
        action?: Function;

        // The before and after hooks can be Functions or an array of Functions
        before?: any;
        after?: any;
        load?: Function;
        unload?: Function;
        reactive?: boolean;
    }

    interface HookOptions {
        except?: string[];
    }

    interface HookOptionsDico {
        [id: string]: HookOptions
    }

    interface Router{

        // Deprecated:  for old "Router" smart package
        page(): void;

        add(route: Object): void;

        to(path: string, ...args: any[]): void;

        filters(filtersMap: Object);

        filter(filterName: string, options?: Object);

        // These are for Iron-Router
        configure(config: GlobalConfig);

        map(func: Function): void;

        route(name: string, handler?: any, routeParams?: MapConfig);

        path(route: string, params?: Object): string;

        url(route: string): string;

        go(route: string, params?: Object): void;

        before(func: Function, options?: HookOptionsDico): void;

        after(func: Function, options?: HookOptionsDico): void;

        load(func: Function, options?: HookOptionsDico): void;

        unload(func: Function, options?: HookOptionsDico): void;

        render(template?: string, options?: TemplateConfigDico): void;

        wait(): void;

        stop(): void;

        redirect(): void;

        current(): any;

        onRun(hook?: string, func?: Function, params?: any): void;

        onBeforeAction(hookOrFunc?: string | Function,
                                funcOrParams?: Function | any, params?: any): void;

        onAfterAction(hook?: string, func?: Function, params?: any): void;

        onStop(hook?: string, func?: Function, params?: any): void;

        onData(hook?: string, func?: Function, params?: any): void;

        waitOn(hook?: string, func?: Function, params?: any): void;

        routes: Object;
        params: any;
    }

    interface RouteController {
        render(route: string);

        extend(routeParams: Router.MapConfig);
    }

    declare var RouteController: RouteController;
    declare var Router:Router;
}