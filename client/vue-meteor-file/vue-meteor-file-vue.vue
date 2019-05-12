<template>
    <div v-if="subscribed">
        <div v-if="file">
            <a :href="link" target="_blank" download>{{file.name}}</a>
            <audio v-if="audioPreview" :src="link" controls></audio>
        </div>
        <div v-if="currentUpload">
            Загрузка <b>{{currentUpload.file.name}}</b>:
            <span id="progress">{{currentUpload.progress.get()}}%</span>

            <div class="progress" style="height: 5px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" :aria-valuenow="currentUpload.progress.get()"
                     aria-valuemin="0" aria-valuemax="100" :style="progressStyle"></div>
            </div>

        </div>
        <div v-else>
            <input :class="schema.class" type="file" :accept="accept"
                   @change="onChange($event)"
                   @drop="onDrop($event)"
                   ondragover="event.preventDefault()"
            />
        </div>
    </div>
</template>

<script>
    import VueMeteorFile from './vue-meteor-file';

    export default VueMeteorFile;
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