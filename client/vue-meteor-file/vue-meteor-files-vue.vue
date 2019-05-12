<template>
    <div>

        <div v-for="(item,index) in items">
            <div v-if="item.file" style="width:100%;display: block;">
                <div style="float:left;width:50%;display: inline;">
                    <a :href="link(item.file)" target="_blank" download>{{item.file.name}}</a>
                </div>
                <div style="width:15px;height:15px;display:inline;float:left;">
                    <a  href="#" @click="removeItem(index)" style="z-index:100000;width:15px;height:15px;display: block; padding:0;" >
                        <img style="" title="Удалить" src="/sliver_close_button.png"/>
                    </a>
                </div>
                <audio v-if="audioPreview(item.file)" :src="link(item.file)" controls></audio>
                <div style="clear: both;"></div>
            </div>
            <div v-else>
                <div v-if="item.upload">
                    Загрузка <b>{{item.upload.file.name}}</b>:
                    <span id="progress">{{item.upload.progress.get()}}%</span>

                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :aria-valuenow="item.upload.progress.get()"
                             aria-valuemin="0" aria-valuemax="100" :style="item.progressStyle"></div>
                    </div>
                </div>
            </div>

        </div>


        <div>
            <input :class="schema.class" type="file" multiple
                   :accept="schema.accept"
                   @change="onChange($event)"
                   ondragover="event.preventDefault()"
            />
        </div>
    </div>
</template>

<script>
    import VueMeteorFiles from './vue-meteor-files';

    export default VueMeteorFiles;
</script>

<style>
    .fileInput {
        border: 3px dashed #999;
        padding: 140px 50px 10px 50px;
        cursor: move;
        position: relative;
    }

    .fileInput:before {
        content: "drag & drop your files here";
        display: block;
        position: absolute;
        text-align: center;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 40px;
        margin: -25px 0 0 -100px;
        font-size: 18px;
        font-weight: bold;
        color: #999;
    }
</style>