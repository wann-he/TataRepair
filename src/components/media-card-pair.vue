<template>
    <div>
        <el-row v-for="(pair, index) in mediaPairs" :key="index" class="media-pair-card">
            <el-col :span="12">
                <el-card>
                    <div class="media-title">
                        <span>{{ pair.left.name }}</span>
                    </div>
                    <div class="media-info">
                       <span class="info"> 路径: {{ pair.left.path }} </span>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card>
                    <div class="media-title">
                        <span>{{ pair.right.name }}</span>
                    </div>
                    <div class="media-info">
                        <span class="info"> 路径: {{ pair.right.path }} </span>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {ElCard} from 'element-plus';
import {Stamp} from "@element-plus/icons-vue";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import {getVideoInfo} from "../script/mp4ToImg";

export interface MediaInfo {
    url: string;
    filename: string;
    name: string;
    path: string;
    suffix: string;
    size: string;
    type: 'video' | 'audio';
}

export interface MediaCardPairProps {
    mediaPairs: {
        left: MediaInfo;
        right: MediaInfo;
    }[];
}

export default defineComponent({
    name: 'MediaCardPair',
    components: {
        Stamp,
        ElCard,
    },
    props: {
        mediaPairs: {
            type: Array as PropType<MediaCardPairProps['mediaPairs']>,
            required: true,
        },
    },
    methods: {
    },
    watch: {
    }
})
</script>

<style scoped>
.media-pair-card {
    display: flex;
    width: 100%;
    height: 120px;
    margin: 20px 0px;
    background-color: #F0F0F0; /* 添加的灰色背景色 */
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); /* 添加的阴影 */
    border-radius: 10px; /* 添加的圆角 */

    .media-info {
        display: flex;
        justify-content: flex-start;
        align-items: baseline;
        color: gray;

        .media-title {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            color: gray;
        }

        .info {
            color: gray; /* 设置文字颜色为灰色 */
            font-size: 0.8rem; /* 设置字体大小，可以根据需求调整 */
            margin-top: 10px;
            margin-right: 10px;
        }
    }
}
</style>