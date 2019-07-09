<template>
    <div :id="fieldId" :class="schema.fieldClasses" v-if="schema">
        <div v-for="(item, index) in value" :class="schema.itemContainerClasses">
      <span v-if="schema.items && schema.itemContainerComponent">
        <component
                :is='schema.itemContainerComponent'
                :model='item'
                :index="index"
                :id="fieldId + 'c' + index"
                :parentId="fieldId"
                :removeElementButtonLabel="removeElementButtonLabel"
                :moveElementUpButtonLabel="moveElementUpButtonLabel"
                :moveElementDownButtonLabel="moveElementDownButtonLabel"
                :itemContainerHeader="schema.itemContainerHeader"
                :schema='generateSchema(value, schema.items, index)'
                @moveItemUp="moveElementUp(index)"
                @moveItemDown="moveElementDown(index)"
                @removeItem='removeElement(index)'>
          <component
                  :is='getFieldType(schema.items)'
                  :model='item'
                  :schema='generateSchema(value, schema.items, index)'
                  :formOptions='formOptions'
                  @model-updated='modelUpdated'/>
        </component>
      </span>
            <span v-else-if="schema.items">
        <component
                :is='getFieldType(schema.items)'
                :model='item'
                :schema='generateSchema(value, schema.items, index)'
                :formOptions='formOptions'
                @model-updated='modelUpdated'/>
      </span>
            <span v-else-if="schema.itemContainerComponent">
        <component
                :is='schema.itemContainerComponent'
                :model='item'
                :index="index"
                :id="fieldId + 'c' + index"
                :parentId="fieldId"
                :removeElementButtonLabel="removeElementButtonLabel"
                :moveElementUpButtonLabel="moveElementUpButtonLabel"
                :moveElementDownButtonLabel="moveElementDownButtonLabel"
                :itemContainerHeader="schema.itemContainerHeader"
                :schema='generateSchema(value, schema.items, index)'
                @moveItemUp="moveElementUp(index)"
                @moveItemDown="moveElementDown(index)"
                @removeItem='removeElement(index)'>
          <input type="text" v-model="value[index]" :class="schema.itemFieldClasses" :name='generateInputName(index)' :id="fieldId + index" />
          <input
                  type="button"
                  :value="removeElementButtonLabel"
                  @click="removeElement(index)"
                  v-if='schema.showRemoveButton'/>
        </component>
      </span>
            <input type="text" v-model="value[index]" :class="schema.itemFieldClasses" :name='generateInputName(index)' :id="fieldId + index" v-else/>
            <input
                    type="button"
                    :value="moveElementUpButtonLabel"
                    :class="schema.moveElementUpButtonClasses"
                    @click="moveElementUp(index)"
                    v-if='schema.showModeElementUpButton'/>
            <input
                    type="button"
                    :value="moveElementDownButtonLabel"
                    :class="schema.moveElementDownButtonClasses"
                    @click="moveElementDown(index)"
                    v-if='schema.showModeElementDownButton'/>
            <input
                    type="button"
                    :value="removeElementButtonLabel"
                    :class="schema.removeElementButtonClasses"
                    @click="removeElement(index)"
                    v-if='schema.showRemoveButton'/>
        </div>
        <input type="button" :value="newElementButtonLabel" :class="schema.newElementButtonLabelClasses" @click="newElement"/>
    </div>
</template>

<script>
    import FieldArrayComponent from './FieldArrayComponent';
    export default FieldArrayComponent;
</script>