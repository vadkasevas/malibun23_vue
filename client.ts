import 'bootstrap/dist/js/bootstrap.bundle';
//@ts-ignore
import Vue from 'vue';

// @ts-ignore
/// <reference path="./typings/vue-form-generator.d.ts" />
import * as VueFormGenerator from "./lib/MeteorVueFormGenerator/index";
// @ts-ignore
import { FieldArray } from './client/vfg-field-array/index';

//@ts-ignore
import Autocomplete from './client/VueAutocomplete';
Vue.component("fieldAutocomple", Autocomplete);

Vue.use(VueFormGenerator);

import {VuetifyPagination} from './client/pagination/VuetifyPagination';
export {VuetifyPagination};

import {action, RouterConfig,VueController,VueAction} from "./lib/VueController";
export {action, RouterConfig,VueController,VueAction};

import PageTitleMixin from './client/vue-page-title/mixin';
export {PageTitleMixin};

import {MeteorComponent} from './client/MeteorComponent/MeteorComponent';
import {CollectionTracker} from './client/MeteorComponent/CollectionTracker';
export {MeteorComponent,CollectionTracker};

import {DataProvider} from "./lib/DataProvider";
export {DataProvider};

import ModelComponent from './lib/ModelComponent';
export {ModelComponent};

import ModuleLibrary from './client/vfg-field-object/src/index';
Vue.use(ModuleLibrary);

import './client/vue-meteor-file/index';

import {VueSchemaBuilder} from './lib/VueSchemaBuilder';
export {VueSchemaBuilder};

import {VueValidationBuilder} from "./lib/VueValidationBuilder";
export  {VueValidationBuilder};