<template>
    <el-scrollbar>
        <h3>音视频工具</h3>
        <el-space :size="'default'" spacer="" style="margin-top: 10px">
            <el-check-tag :checked="checked1" type="primary" @change="onChange1">
                音频提取
            </el-check-tag>
            <!--            <el-check-tag :checked="checked2" type="primary" @change="onChange2">-->
            <!--                音视频合并-->
            <!--            </el-check-tag>-->
            <el-check-tag :checked="checked3" type="success" @change="onChange3">
                视频-格式转换
            </el-check-tag>
            <!--            <el-check-tag :checked="checked4" type="danger" @change="onChange4">-->
            <!--                音频-格式转换-->
            <!--            </el-check-tag>-->
        </el-space>

        <div class="box select-box">
            <div class="box select-button"
                 :class="allDisabled ? 'disable-button' : '' "
                 @click="selectVideo" v-show="checked1 || checked2 || checked3">+ 选择视频
            </div>
            <div class="box select-button-green"
                 :class="allDisabled ? 'disable-button' : '' "
                 @click="selectAudio" v-show=" checked2 || checked4">+ 选择音频
            </div>
            <div class="box" @click="start"
                 :class="[out_path && !allDisabled ? 'start-button' : 'default-button disable-button']"
            >开始转码
            </div>
        </div>


        <div class="box path-box">
            <el-space :size="'default'" spacer="" style="margin-top: 10px" direction="vertical" alignment="flex-start">
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="输出文件夹路径">
                            <el-col :span="20">
                                <el-input v-model="out_path" class="m-2" placeholder="输出文件夹路径"
                                          :disabled="true"
                                          @click="selectOutDir"
                                          size="default"
                                          clearable>
                                    <template #append>
                                        <el-button @click="selectOutDir" type="default" style="width: 115px"
                                                   :disabled="allDisabled" class="m-2">点击此处选择
                                        </el-button>
                                    </template>
                                </el-input>
                            </el-col>
                            <el-col :span="2">
                                <el-button @click="openOutDir" type="primary" link :disabled="!out_path">打开
                                </el-button>
                            </el-col>
                        </el-form-item>
                    </el-col>
                    <el-col :span="18"></el-col>
                    <el-col :span="6">
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="24" v-show="checked1">
                        <el-form-item label="输出音频格式">
                            <el-radio-group v-model="out_audio_scheme" :disabled="allDisabled">
                                <el-radio value="mp3">mp3</el-radio>
                                <el-radio value="flac">flac</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-show="checked3">
                        <el-form-item label="输出视频格式">
                            <el-radio-group v-model="out_video_scheme" :disabled="allDisabled">
                                <el-radio value="mp4">mp4</el-radio>
                                <el-radio value="mkv">mkv</el-radio>
                                <el-radio value="mov">mov</el-radio>
                                <el-radio value="3gp">3gp</el-radio>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-show="checked4">
                        <el-form-item label="完成后删除子文件夹">
                            <el-switch v-model="delSubAfter" :disabled="allDisabled"/>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-space>
        </div>

        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="任务列表" name="first">
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-button @click="clearDoneAll" type="primary" link style="float: right"
                                   :disabled="allDisabled">清空列表
                        </el-button>
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="24" v-show="checked1 || checked3">
                        <keep-alive>
                            <component :is="VideoCard" :videos="videos"/>
                        </keep-alive>
                    </el-col>
                    <el-col :span="24" v-show="checked2">
                        <keep-alive>
                            <component :is="MediaCardPair" :media-pairs="mediaPairs"/>
                        </keep-alive>
                    </el-col>
                </el-row>
            </el-tab-pane>
            <!--            <el-tab-pane label="完成" name="second">-->
            <!--                <Complete v-for="file in completeList" :key="file" :file-name="file"/>-->
            <!--            </el-tab-pane>-->

        </el-tabs>
    </el-scrollbar>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {open} from '@tauri-apps/api/dialog'
import {appDataDir} from '@tauri-apps/api/path'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {FConfig, replaceFilename, upgradeFile2Curr} from '../script/filetools'
import {convertFileSrc} from '@tauri-apps/api/tauri'
import {open as shellopen} from "@tauri-apps/api/shell";
import {ChatModelVal, MultipleVal, ReplaceTypeVal} from "../script/constants";
import {convert, video2Audio} from "../script/media";
import VideoCard from "./video-card.vue";
import MediaCardPair, {MediaInfo} from "./media-card-pair.vue";
import {basename} from "pathe";
import {getVideoInfo, Videoo} from "../script/mp4ToImg";
import {sendNotify} from "../script/notification";

const allDisabled = ref(false)

const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
const checked5 = ref(false)

const recursively = ref(false)
const delSubAfter = ref(false)

const out_audio_scheme = ref<'flac'|'mp3'>('mp3')
const out_video_scheme = ref<'mp4' | 'mkv' | 'mov' | '3gp'>('mp4')

const onChange1 = (status: boolean) => {
    checked1.value = status
    if (status) {
        checked2.value = false
        checked3.value = false
        checked4.value = false
        checked5.value = false
    }

}

const onChange2 = (status: boolean) => {
    checked2.value = status
    if (status) {
        checked1.value = false
        checked3.value = false
        checked4.value = false
        checked5.value = false
    }

}

const onChange3 = (status: boolean) => {
    checked3.value = status
    if (status) {
        checked1.value = false
        checked2.value = false
        checked4.value = false
        checked5.value = false
    }

}

const onChange4 = (status: boolean) => {
    checked4.value = status
    if (status) {
        checked1.value = false
        checked2.value = false
        checked3.value = false
        checked5.value = false
    }

}

const onChange5 = (status: boolean) => {
    checked5.value = status
    if (status) {
        checked1.value = false
        checked2.value = false
        checked3.value = false
        checked4.value = false
    }
}

const model = ChatModelVal
const replaceType = ReplaceTypeVal
const multiple = MultipleVal
const codingModeVal = ref<'libx264' | 'hevc_nvenc'>('libx264')

const suffixVal = ref<'_copy' | '_opt_origin'>('_opt_origin')
const suffixOptions = [
    {
        value: '_copy',
        label: '不改变原数据',
    },
    {
        value: '_opt_origin',
        label: '直接操作原数据',
    }
]
const activeName = ref('first')
const labelPosition = ref('right')
const thread = ref(1);

let leftMedia: MediaInfo = {name: "", filename: "", path: "", size: "", suffix: "", type: 'video', url: ""}
let rightMedia: MediaInfo = {name: "", filename: "", path: "", size: "", suffix: "", type: 'video', url: ""}
const mediaPairs = ref([
    {
        left: leftMedia,
        right: rightMedia,
    }
]);
const videoList: Videoo[] = []
const videos = ref(videoList);

/**
 * 切换面板
 * @param tab
 * @param event
 */
const handleClick = (tab: TabsPaneContext, event: Event) => {
}

/** 选择的目录路径 */
const out_path = ref('')
const tobe_replaced = ref('')
const replaced_with = ref('')
const num = ref(1)
const numShow = ref(false)

/** 选择目录 */
async function selectVideo() {
    const isMultiple = checked1.value || checked3.value ? true : false;
    const selected = await open({
        directory: false,
        multiple: isMultiple,
        defaultPath: await appDataDir(),
        filters: [
            {
                name: "视频文件",
                extensions: ['mp4', '3gp', 'avi', 'mov', '.m4a']
            }
        ],
    })
    if (selected) {
        console.log(selected)
        let arr: Array<string> = [];
        const videoList: Videoo[] = []
        if (isMultiple) {
            arr = selected as Array<string>;
        } else {
            arr.push(selected as string);
        }
        arr.forEach((item) => {
            leftMedia = {
                name: basename(item),
                filename: item,
                path: item,
                size: "",
                suffix: "",
                url: convertFileSrc(item),
                type: 'video'
            };
            if (checked1) {
                const vvd: Videoo = {
                    url: convertFileSrc(item),
                    percentage: 0,
                    name: basename(item),
                    path: item,
                    codingMode: codingModeVal.value,
                    suffix: suffixVal.value,
                    stages: [
                        {progress: 0, status: '', name: ''}
                    ]
                }
                videoList.push(vvd)
            }
            if (checked2) {
                mediaPairs.value = [{left: leftMedia, right: rightMedia}]
            }
            // 当选择时才修改path的值
            let currPath = ref('')
            currPath.value = item.split('\\').slice(0, -1).join('\\')
            if (!out_path.value) {
                out_path.value = currPath.value;
            }
        })

        videos.value = videoList

        console.log('videos', videos.value)
        console.log('mediaPairs', mediaPairs.value)
    }
}

async function selectAudio() {
    const isMultiple = checked4.value ? true : false;
    const selected = await open({
        directory: false,
        multiple: isMultiple,
        defaultPath: await appDataDir(),
        filters: [
            {
                name: "音频文件",
                extensions: ['mp3', 'flac', 'wma']
            }
        ],
    })
    if (selected) {
        console.log(selected)
        let arr: Array<string> = [];
        if (isMultiple) {
            arr = selected as Array<string>;
        } else {
            arr.push(selected as string);
        }
        arr.forEach((item) => {
            rightMedia = {
                name: basename(item),
                filename: item,
                path: item,
                size: "",
                suffix: "",
                url: convertFileSrc(item),
                type: 'audio'
            };
            if (checked2) {
                mediaPairs.value = [{left: leftMedia, right: rightMedia}]
            }
            // 当选择时才修改path的值
            let currPath = ref('')
            currPath.value = item.split('\\').slice(0, -1).join('\\')
            if (!out_path.value) {
                out_path.value = currPath.value;
            }
        })
        console.log('videos', videos.value)
        console.log('mediaPairs', mediaPairs.value)
    }
}


const clearDoneAll = () => {
    console.log("clearDoneAll.")
    videos.value.length = 0;
    mediaPairs.value.length = 0;
    out_path.value = ''
    allDisabled.value = false
}


async function start() {
    const arr = out_path.value.split('/')
    console.log(arr)
    console.log(new Date());
    // 如果没有选择，则退出报错
    if (!out_path.value) {
        ElMessage({
            message: '未选择文件|目录',
            type: 'success'
        })
        return
    }
    allDisabled.value = true

    console.log(`开始时间：${new Date()}`);
    if (checked1.value) {
        const result = await video2Audio({
            audio_scheme: out_audio_scheme.value,
            num: 0,
            out_path: out_path.value,
            out_video_scheme: undefined,
            type: 0
        }, videos.value)
            .then((res) => {
                console.log(res)
                sendNotify(`批量音频提取完成`)
            })
            .catch((reson) => {
                console.log(`Error when video2Audio...${reson}`)
                sendNotify(`转换异常${reson}`)
            });
    }
    if (checked3.value) {
        const result = await convert(
            {
                audio_scheme: undefined,
                num: 0,
                out_path: out_path.value,
                out_video_scheme: out_video_scheme.value,
                type: 0
            }, videos.value)
            .then((res) => {
                console.log(res)
                sendNotify(`批量格式转换完成`)
            })
            .catch((reason) => {
                console.log('Error when video2Audio...:${reason}', reason)
                sendNotify(`转换异常:${reason}`)
            });
    }
    allDisabled.value = false
    return
}

async function selectOutDir() {
    const selected = await open({
        directory: false,
        multiple: true,
        defaultPath: await appDataDir(),
    })
    if (selected) {
        out_path.value = selected.toString()
        console.log('out_path:' + out_path.value)
        // 当选择时才修改path的值
        console.log(selected)
    }
}

async function selectVideos() {
    const selected = await open({
        directory: false,
        multiple: true,
        defaultPath: await appDataDir(),
    })
    if (selected) {
        out_path.value = selected.toString()
        console.log('out_path:' + out_path.value)
        // 当选择时才修改path的值
        console.log(selected)
    }
}

const openOutDir = () => {
    console.log("openOutDir.")
    shellopen(out_path.value);
    // invoke<string[]>('open_out_dir', {path: path.value})
}


const startJob = (type: number) => {
    console.log("startJob." + type)
    if (type == 1) {
        upgradeFile2Curr(out_path.value, recursively.value, delSubAfter.value).then(res => {
            if (res.rcode == 1) {
                ElMessage({
                    message: '文件提级成功',
                    type: 'success'
                })
            }
            return
        }).finally();
    }
    if (type == 2) {
        const fconfig: FConfig = {
            tobe_replaced: tobe_replaced.value,
            replaced_with: replaced_with.value,
            type: replaceType.value,
            num: num.value
        }
        replaceFilename(out_path.value, fconfig)
            .then(res => {
                if (res.rcode == 1) {
                    ElMessage({
                        message: res.failedNum > 0 ? '批量重命名完成,' + res.failedNum + '个失败' : '文件批量重命名成功',
                        type: 'success'
                    })
                }
                return
            })
            .finally();
    }
}

const replaceTypeChange = (value: number) => {
    if (value == 3 || value == 4 || value == 5) {
        numShow.value = true
    } else {
        num.value = 1
        numShow.value = false
    }
}

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    // return false
    return true
}
</script>

<style scoped lang="scss">
.box {
    background-color: #F0F0F0;
    margin: 12px 12px;
    border-radius: 12px;
    color: #fff;
}

.el-card {
    width: 500px;
}

.el-col {
    padding: 0;
}

.tip {
    color: red;
    margin: 3px auto;
    text-align: right;
}

.el-container {
    width: 100vw;
    height: 100vh;
    // padding-top: 30px;
}

.title {
    width: 170px;
    height: 50px;
    // margin-top: 20px;
    text-align: center;
    line-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.select-box {
    height: 80px;
    display: flex;
    align-items: center;
}

.path-box {
    height: 150px;
    display: list-item;
    align-items: center;
    padding: 5px 15px;
}

%btn {
    width: 150px;
    height: 50px;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
    color: #fff;
}

.select-button {
    background-color: #1e2c42;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #409eff;
    }
}

.select-button-green {
    background-color: #2d3c5b;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #409eff;
    }
}

.default-button {
    background-color: #555;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #444;
    }
}

.start-button {
    background-color: #67c23a;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #67c23a;
    }
}

.text-red {
    color: red;
}

.disable-button {
    cursor: not-allowed;
    pointer-events: none;
}
</style>
