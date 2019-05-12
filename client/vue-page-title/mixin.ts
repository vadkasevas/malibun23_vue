const isFunction = object => typeof (object) === 'function';
import {_} from 'meteor/underscore';

const PageTitleMixin = {
    created(){
        const title = this.$route.meta?this.$route.meta.title:undefined;
        if (title !== undefined) {
            // allow use dinamic title system
            try {
                this.$title = isFunction(title)
                    ? title.call(this, this)
                    : title;
                if (_.isString(this.$title)) {
                    document.title = this.$title;
                } else if (this.$title instanceof Promise) {
                    this.$title.then(($title) => {
                        this.$title = $title;
                        document.title = $title;
                    })
                }
            } catch (e) {
                console.error(e);
                document.title = e;
            }
        }
    },
    updated () {
        const title = this.$route.meta?this.$route.meta.title:undefined;
        if (title !== undefined) {
            // allow use dinamic title system
            try {
                this.$title = isFunction(title)
                    ? title.call(this, this)
                    : title;
                if (_.isString(this.$title)) {
                    document.title = this.$title;
                } else if (this.$title instanceof Promise) {
                    this.$title.then(($title) => {
                        this.$title = $title;
                        document.title = $title;
                    })
                }
            } catch (e) {
                console.error(e);
                document.title = e;
            }
        }
    }
};

export default PageTitleMixin;
