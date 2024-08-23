<template>
    <el-scrollbar>
        <el-space :size="'default'" spacer="" style="margin-top: 10px">
            <el-check-tag :checked="checked1" type="primary" @change="onChange1">
                音频提取
            </el-check-tag>
            <el-check-tag :checked="checked3" type="success" @change="onChange3">
                视频-格式转换
            </el-check-tag>
            <el-check-tag :checked="checked4" type="danger" @change="onChange4">
                命令行模式-AI
            </el-check-tag>
        </el-space>

        <el-button @click="resetAll" type="default" style="float: right" link
                   class="m-2">重置
        </el-button>

        <div class="content-box content-select-box" v-show="checked1 || checked3">
            <div class="content-box select-button"
                 :class="allDisabled ? 'disable-button' : '' "
                 @click="selectVideo" v-show="checked1 ||  checked3">+ 选择视频
            </div>
            <div class="content-box select-button-green"
                 :class="allDisabled ? 'disable-button' : '' "
                 @click="selectAudio" v-show=" checked2">+ 选择音频
            </div>
            <div class=content-box @click="start"
                 :class="[out_path && !allDisabled ? 'start-button' : 'default-button disable-button']"
            >开始转码
            </div>
        </div>


        <el-space :size="'default'" spacer="" style="margin-top: 10px" direction="vertical" alignment="flex-start">
            <el-row :gutter="24">
                <el-col :span="24" v-show="checked1 || checked2">
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
            </el-row>
            <el-card style="max-width: 1200px" v-show="checked4">
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="Base文件夹" v-show="checked4">
                            <el-col :span="22">
                                <el-input v-model="out_path" class="m-2"
                                          placeholder="需求描述中可用'${path}'来指代"
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
                        </el-form-item>
                    </el-col>
                    <el-col :span="18"></el-col>
                    <el-col :span="6">
                        <el-button @click="openOutDir" type="primary" link :disabled="!out_path">打开
                        </el-button>
                        <el-button @click="append2Question" type="primary" link :disabled="!out_path">插入
                        </el-button>
                    </el-col>
                    <el-col :span="24" style="margin: 5px 5px">
                        <div class="tata-tip">注意: 请先在设置中配置通义千问的API密钥, 否则将无法使用。</div>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="选择模型">
                            <el-select v-model="qwen_model" class="m-2" placeholder="选择模型" size="default">
                                <el-option v-for="item in QWNE_OPTIONAL_MODELS" :key="item" :label="item"
                                           :value="item"/>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24">
                        <el-form-item label="需求描述">
                            <el-input v-model="question" class="m-2"
                                      placeholder="描述媒体文件处理需求，注意一定是用单行ffmpeg命令可以处理的需求"
                                      autosize
                                      :rows="2"
                                      type="textarea"
                                      clearable>
                            </el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="18">
                    </el-col>
                    <el-col :span="6">
                        <el-button @click="chat_chat()" :loading="chatBtnLoading" type="primary" link
                                   style="float: right;">生成命令行
                        </el-button>
                    </el-col>
                    <el-col :span="24" style="margin-top: 3px">
                        <el-form-item label="生成命令">
                            <el-input
                                v-model="answer"
                                placeholder="命令行可以自行修改，确保命令行以 ffmpeg 开头，否则无法执行"
                                clearable
                            />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="命令预览" v-show="executable">
                            <el-col :span="22">
                                <el-tag type="info">{{ answer }}</el-tag>
                            </el-col>
                        </el-form-item>
                    </el-col>
                    <el-col :span="18">
                    </el-col>
                    <el-col :span="6">
                        <el-button :disabled="!executable" @click="execute()" :loading="executeBtnLoading"
                                   type="primary" link
                                   style="float: right;">执 行
                        </el-button>
                    </el-col>
                    <el-col :span="24" style="margin-top: 3px">
                        <el-form-item label="执行日志">
                            <el-input v-model="execute_logs" class="m-2"
                                      placeholder=""
                                      :rows="9"
                                      type="textarea"
                                      :disabled="true"
                                      clearable>
                            </el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-card>
        </el-space>

        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" v-show="checked1 || checked3">
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
        </el-tabs>
    </el-scrollbar>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {open} from '@tauri-apps/api/dialog'
import {appDataDir} from '@tauri-apps/api/path'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {convertFileSrc} from '@tauri-apps/api/tauri'
import {open as shellopen} from "@tauri-apps/api/shell";
import {MultipleVal, QwenModelVal} from "../script/constants";
import {convert, executeCustomCommand, video2Audio} from "../script/media";
import VideoCard from "./video-card.vue";
import MediaCardPair, {MediaInfo} from "./media-card-pair.vue";
import {basename} from "pathe";
import {Videoo} from "../script/mp4ToImg";
import {sendNotify} from "../script/notification";
import {completeChat} from "../script/openai";
import {readConfig} from "../script/settings";

const allDisabled = ref(false)

const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
const checked5 = ref(false)


const out_audio_scheme = ref<'flac' | 'mp3'>('mp3')
const out_video_scheme = ref<'mp4' | 'mkv' | 'mov' | '3gp'>('mp4')

const question = ref('')
const answer = ref('')
const executable = ref(false)
const execute_logs = ref('')
const chatBtnLoading = ref(false)
const executeBtnLoading = ref(false)

watch(
    answer,
    (newval, oldval) => {
        console.log('watch,newval:{},oldval::{}', newval, oldval)
        executable.value = newval != undefined && newval != '' && newval.startsWith('ffmpeg')
    },
    // {immediate: true}
);

const resetAll = () => {
    question.value = ''
    answer.value = ''
    executable.value = false
    execute_logs.value = ''
    out_path.value = ''
    allDisabled.value = false

    // checked1.value = false
    // checked3.value = false
    // checked4.value = false

}


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

const qwen_model = QwenModelVal
const multiple = MultipleVal
const codingModeVal = ref<'libx264' | 'hevc_nvenc'>('libx264')
const QWNE_OPTIONAL_MODELS = ref([''])

const suffixVal = ref<'_copy' | '_opt_origin'>('_opt_origin')
const activeName = ref('first')
const labelPosition = ref('right')

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


readConfig().then((conf) => {
    QWNE_OPTIONAL_MODELS.value = conf.qwen.models
})


const chat_chat = () => {
    if (!question.value) {
        ElMessage({
            message: '请输入需求描述',
            type: 'warning'
        })
        return;
    }
    let qry: string = question.value.replace("${path}", out_path.value);

    readConfig()
        .then((conf) => {
            if (!conf.qwen.ak) {
                ElMessage({
                    message: '通义千问的AK未设置',
                    type: 'error'
                })
                return;
            }
            chatBtnLoading.value = true;
            completeChat(qwen_model.value, qry)
                .then((res) => {
                    answer.value = res;
                })
                .catch((reason) => {
                    answer.value = reason
                }).finally(() => {
                chatBtnLoading.value = false;
            })
        })
        .catch((reason) => {
            ElMessage({
                message: '读配置错误：' + reason,
                type: 'error'
            })
        });


}

const execute = () => {
    const text: string = answer.value;
    if (!text || !text.startsWith('ffmpeg')) {
        ElMessage({
            message: '没有可执行的命令行',
            type: 'warning'
        })
        return;
    }
    executeBtnLoading.value = true;
    executeCustomCommand(answer.value)
        .then((res) => {
            // sendNotify(res.data);
            execute_logs.value = res.data;
            ElMessage({
                message: '执行完成',
                type: res.rcode === 0 ? 'success' : 'warning'
            })
            return;
        })
        .catch((reason) => {
            ElMessage({
                message: '执行失败:' + reason,
                type: 'error'
            })
            return;
        })
        .finally(() => {
            executeBtnLoading.value = false;
        });
}

/**
 * 切换面板
 * @param tab
 * @param event
 */
const handleClick = (tab: TabsPaneContext, event: Event) => {
}

/** 选择的目录路径 */
const out_path = ref('')
const num = ref(1)

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
        directory: true,
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
}
const append2Question = () => {
    console.log("append2Question.")
    question.value = question.value + out_path.value;
}

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    // return false
    return true
}
</script>

<style scoped lang="scss">

.el-col {
    padding: 0;
}

.tata-tip {
    color: #f36262;
    margin: 5px 5px;
    text-align: right;
    font-size: 12px;
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
