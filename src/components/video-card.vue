<template>
    <div class="video-card" v-for="(video, index) in videos" :key="index">
        <div class="checkmark" v-if="video.stages[2].progress === 100">
<!--            <el-button type="danger" :icon="Delete" circle @click=""/>-->
            <el-icon v-if="video.stages[2].progress === 100" :size="30" color="#107929">
                <SuccessFilled/>
            </el-icon>
        </div>

        <div class="video-info">
            <div class="title-res">
                <h3>{{ video.name }}</h3>
            </div>
            <div class="v-info">
                <span class="info">分辨率：{{ video.resolution }}</span>
                <span class="info">时长：{{ video.duration }}</span>
                <span class="info">帧率：{{ video.frameRate }}</span>
            </div>
            <div class="stages">
                <div v-for="(stage, index) in video.stages" :key="index" class="stage">
                    <el-progress
                        :stroke-width="10"
                        :percentage="stage.progress"
                        :status="stage.status"
                        :show-text="false"
                    ></el-progress>
                    <p class="stage-info">{{ stage.name }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import {ElImage, ElProgress} from 'element-plus';
import {Delete,SuccessFilled} from "@element-plus/icons-vue";

export default defineComponent({
    name: "VideoCard",
    components: {
        [ElImage.name]: ElImage,
        [ElProgress.name]: ElProgress
    },
    props: {
        videos: {
            type: Array,
            required: true
        },
    },
    data() {
        return {};
    },
    methods: {
        Delete() {
            return Delete
        }
        // getProgressStatus(status: string | undefined) {
        //     return status === "In progress" ? "active" : status === "Completed" ? "success" : "exception";
        // },
    }
});
</script>

<style>
.video-card {
    display: flex;
    width: 100%;
    height: 180px;
    margin: 20px;
    background-color: #F0F0F0; /* 添加的灰色背景色 */
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* 添加的阴影 */
    border-radius: 10px; /* 添加的圆角 */
}

.video-info {
    flex: 2;
    padding: 20px;
}

.title-res {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    color: gray;
}

.v-info {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    color: gray;

    .info {
        color: gray; /* 设置文字颜色为灰色 */
        font-size: 0.8rem; /* 设置字体大小，可以根据需求调整 */
        margin-top: 10px;
        margin-right: 10px;
    }
}

.resolution {
    color: gray; /* 设置文字颜色为灰色 */
    font-size: 0.8rem; /* 设置字体大小，可以根据需求调整 */
}

.stages {
    display: flex;
    flex-flow: row;
    margin-top: 50px;
}

.stage {
    flex: 1; /* 让每个阶段的进度条占据等同的空间 */
    margin: 0 2px; /* 你可以根据需要调整间距 */
}

.stage-info {
    margin-top: 10px;
    color: gray;
    font-size: 0.8rem; /* 设置字体大小，可以根据需求调整 */
    text-align: center;
}

.checkmark {
    position: absolute;
    right: 10px;
    top: 20px;
}

</style>