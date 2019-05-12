Package.describe({
    name: 'malibun23:vue',
    version: '0.0.1',
    summary: 'VueJS',
    git: 'https://github.com/vadkasevas/malibun23_vue',
    documentation: 'README.md',
});

Npm.depends({
    "typescript": "3.3.4000",
    "vuetify": "1.5.7",
    "vue-property-decorator": "8.1.0",
    "vue-form-generator": "2.3.4",
    "vfg-field-array": "0.0.1",
    "bootstrap": "4.3.1",
    "bootstrap-vue": "2.0.0-rc.15",
    "jquery": "3.3.1",
    "object-hash":"1.3.1",
    "async":"2.6.2",
    "lodash.isequal":"4.5.0",
    "lodash":"4.17.11"
});

Package.onUse(function(api) {
    api.versionsFrom('1.8.0.1');
    api.use('meteor-base');
    api.use('ecmascript');
    api.use('akryum:vue');
    api.use('akryum:vue-component');
    api.use('akryum:vue-pug');
    api.use('akryum:vue-sass');
    api.use('akryum:vue-router2');
    api.use('akryum:vue-blaze-template');
    api.use('ejson');
    api.use('barbatus:typescript');
    api.use('underscore');
    api.use('minimongo');
    api.use('malibun23:stack');

    api.mainModule('server.ts', 'server');
    api.mainModule('client.ts', 'client');
    api.export(['DataProvider','VuetifyPagination','action','RouterConfig','VueController','VueAction','PageTitleMixin'
    ,'MeteorComponent','CollectionTracker','ModelComponent','VueSchemaBuilder','VueValidationBuilder'],'client');

    api.export(['VueSchema','VueSchemaBuilder','VueValidationBuilder'],'server');
});