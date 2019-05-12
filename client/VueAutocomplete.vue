<template>
    <v-autocomplete
            :search-input.sync="search"
            v-model="value"
            :disabled="loading"
            :items="models"
            box
            chips
            item-text="label"
            item-value="value"
            :hide-selected="true"
            multiple
            attach
    >
        <template v-slot:selection="data">
            <v-chip
                    :selected="data.selected"
                    close
                    class="chip--select-multi"
                    @input="remove(data.item)"
            >
                {{ data.item.label }}
            </v-chip>
        </template>

        <template v-slot:item="data">
            <template v-if="typeof data.item !== 'object'">
                <v-list-tile-content v-text="data.item"></v-list-tile-content>
            </template>
            <template v-else>

                <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.label"></v-list-tile-title>
                </v-list-tile-content>
            </template>
        </template>
    </v-autocomplete>
</template>

<script>
    import VueAutocompleteComponent from './VueAutocompleteComponent';
    export default VueAutocompleteComponent;
</script>