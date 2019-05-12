import mixin from './mixin'
import { setPageTitle } from './page-title'
import { setup as setupRouter } from './router'

const install = (Vue, options = {}) => {
    // prevent double install
    /* istanbul ignore next */
    if (install.installed) return
    install.installed = true

    // title state
    /*const $page = {
        title: ''
    }

    const setTitle = value => {
        setPageTitle(value, options)
        $page.title = value
    }

    // make reactive title
    Vue.util.defineReactive($page, 'title', '')

    // add title to component context
    Object.defineProperty(Vue.prototype, '$title', {
        get: function(){
            console.log('$page.title this:',this);
            return $page.title
        },
        set: value => setTitle(value)
    })

    // vue router support
    if (options.router) {
        setupRouter(setTitle, options)
    }

    */
    Vue.mixin(mixin)
}

const VuePageTitle = { install }

export { install }
export {VuePageTitle}