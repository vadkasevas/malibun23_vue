import { abstractField } from "vue-form-generator";
import {_} from 'meteor/underscore';
import {Meteor} from "meteor/meteor";
import QueryBuilder from './querybuilder.standalone';
import QueryBuilderRu from './query-builder.ru';
import {$} from 'meteor/jquery';
if(Meteor.isClient){
    QueryBuilder();
    QueryBuilderRu();
}
let id = 0;

export default {
    mixins: [ abstractField ],
    data(){
        return {
            id:++id
        }
    },
    mounted(){
        let $el = $(this.$el);
        $el.queryBuilder({
            rules:!_.isEmpty(this.schema.rules)?this.schema.rules:undefined,
            filters:this.schema.filters,
            allow_empty:typeof ( this.schema.allow_empty ) != 'undefined' ? this.schema.allow_empty : undefined,
            allow_invalid:typeof ( this.schema.allow_invalid ) != 'undefined' ? this.schema.allow_invalid : undefined,
            allow_groups:typeof ( this.schema.allow_groups ) != 'undefined' ? this.schema.allow_groups : undefined,
            icons: {
                add_group: 'fas fa-plus-circle',
                add_rule: 'fas fa-plus',
                remove_group: 'fas fa-minus-square',
                remove_rule: 'fas fa-minus-circle',
                error: 'fas fa-exclamation-triangle',
                sortable: 'fas fa-exclamation-triangle'
            },
            templates: {
                group: '\
                <div id="{{= it.group_id }}" class="rules-group-container"> \
                    <div class="rules-group-header"> \
                    <div class="btn-group btn-group-sm float-right group-actions" role="group"> \
                        <button type="button" class="btn btn-success" data-add="rule"> \
                        <i class="{{= it.icons.add_rule }}"></i> {{= it.lang.add_rule }} \
                        </button> \
                        {{? it.settings.allow_groups===-1 || it.settings.allow_groups>=it.level }} \
                        <button type="button" class="btn btn-success" data-add="group"> \
                            <i class="{{= it.icons.add_group }}"></i> {{= it.lang.add_group }} \
                        </button> \
                        {{?}} \
                        {{? it.level>1 }} \
                        <button type="button" class="btn btn-danger" data-delete="group"> \
                            <i class="{{= it.icons.remove_group }}"></i> {{= it.lang.delete_group }} \
                        </button> \
                        {{?}} \
                    </div> \
                    <div class="btn-group btn-group-sm group-conditions" role="group"> \
                        {{~ it.conditions: condition }} \
                        <label class="btn btn-primary"> \
                            <input type="radio" name="{{= it.group_id }}_cond" value="{{= condition }}"> {{= it.lang.conditions[condition] || condition }}  \
                        </label> \
                        {{~}} \
                    </div> \
                    {{? it.settings.display_errors }} \
                        <div class="error-container"><i class="{{= it.icons.error }}"></i></div> \
                    {{?}} \
                    </div> \
                    <div class="rules-group-body"> \
                    <div class="rules-list"></div> \
                    </div> \
                </div>',
                rule: '\
                        <div id="{{= it.rule_id }}" class="rule-container"> \
                          <div class="rule-header"> \
                            <div class="btn-group btn-group-sm float-right rule-actions" role="group"> \
                              <button type="button" class="btn btn-danger" data-delete="rule"> \
                                <i class="{{= it.icons.remove_rule }}"></i> {{= it.lang.delete_rule }} \
                              </button> \
                            </div> \
                          </div> \
                          {{? it.settings.display_errors }} \
                            <div class="error-container"><i class="{{= it.icons.error }}"></i></div> \
                          {{?}} \
                          <div class="rule-filter-container"></div> \
                          <div class="rule-operator-container"></div> \
                          <div class="rule-value-container"></div> \
                        </div>'
            }
        });

        // /jqueryQueryBuilder.removeClass('form-inline');


        $el.on('afterAddGroup.queryBuilder afterAddRule.queryBuilder afterDeleteRule.queryBuilder afterCreateRuleFilters.queryBuilder afterCreateRuleOperators.queryBuilder ' +
            ' afterUpdateRuleValue.queryBuilder afterUpdateRuleFilter.queryBuilder afterUpdateRuleOperator.queryBuilder afterUpdateGroupCondition.queryBuilder afterSetFilters.queryBuilder ' +
            'afterInvert.queryBuilder'
            ,  (e, rule, error, value)=>{
                if(this.schema.changed) {
                    this.schema.changed.apply (this, [$el, rule, error, value]);
                    this.value = rule;
                }

            });

    },
    methods:{
        onChange(){

        },
        updated() {
            this.$nextTick(function () {
                //this.file = this.schema.collection.findOne(this.value);
            });
        }
    }
}