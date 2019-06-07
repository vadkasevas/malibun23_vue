<template>
    <div class="d-flex" v-if="">
        <div class="form-autocomplete">
            <div v-if="!multiple">
                <input v-if="!value" v-model="search" type="text" :placeholder="placeholder" @focus="showOptions"/>
                <div class="items-selected">
                    <div class="item-selected" v-for="(item) in selectedItems">
                        <slot name="selected" :item="item">{{item.label}}</slot> <button @click="remove">remove</button>
                    </div>
                </div>
                <ul class="options" v-show="showUnselected">
                    <li v-for="item in unselectedItems" @click="addItem(item)">
                        <slot :item="item">{{item.label}}</slot>
                    </li>
                    <li v-if="unselectedItems.length===0">Нет данных</li>
                </ul>
            </div>
            <div v-else>
                <input v-model="search" type="text" :placeholder="placeholder" @focus="showOptions"/>
                <div class="items-selected">
                    <div class="item-selected" v-for="(item, index) in selectedItems">
                        <slot name="selected" :item="index">{{item.label}}</slot> <button @click="remove(index)">remove</button>
                    </div>
                </div>
                <ul class="options" v-show="showUnselected">
                    <li v-for="item in unselectedItems" @click="addItem(item)">
                        <slot :item="item">{{item.label}}</slot>
                    </li>
                    <li v-if="unselectedItems.length===0">Нет данных</li>
                </ul>
            </div>
        </div>
    </div>
</template>
<script>
    import VueAutocompleteComponent2 from './Autocomplete2Vue';
    export default VueAutocompleteComponent2;
</script>
<style scoped>
    .d-flex {
        display: flex;
        flex-wrap: wrap;
    }
    .d-flex-item {
        width: 300px;
        padding: 10px;
        border: 1px solid #eaeaea;
        margin: 0 20px 20px 0;
    }
    .form-autocomplete {
        padding: 10px;
        #background: #eaeaea;
    }

    ul {
        width: 200px;
        padding-left: 0;
    }
    ul > li {
        cursor: pointer;
        list-style: none;
        padding: 5px;
        margin-bottom: 5px;
        border: 1px solid white;
        //background: #dedede;
    }
    ul > li:hover {
        background: #313131;
        color: white;
    }
    ul > li.disabled,
    ul > li.disabled:hover {
        //background: #eaeaea;
        color: #a7a7a7;
        cursor: inherit;
    }
    ul > li.disabled .flag-icon {
        opacity: 0.5;
    }

    .items-selected {
        margin-top: 20px;
    }
    .item-selected {
        border-radius: 5px;
        display: inline-block;
        padding: 5px;
        background: #7b8fdc;
        color: white;
        margin: 0 5px 10px 0;
    }
</style>