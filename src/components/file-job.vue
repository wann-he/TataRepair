<template>
    <el-scrollbar>
        <el-space :size="'default'" spacer="" style="margin-top: 10px">
            <el-check-tag :checked="checked1" type="primary" @change="onChange1">
                文件提级
            </el-check-tag>
            <el-check-tag :checked="checked2" type="success" @change="onChange2">
                批量重命名
            </el-check-tag>
            <!--            <el-check-tag :checked="checked3" type="danger" @change="onChange3">-->
            <!--                格式转换-->
            <!--            </el-check-tag>-->
            <!--            <el-check-tag :checked="checked4" type="warning" @change="onChange4">-->
            <!--                自由模式(chatGPT)-->
            <!--            </el-check-tag>-->
        </el-space>

        <div class="content-box path-box">
            <el-space :size="'default'" spacer="" style="margin-top: 10px" direction="vertical" alignment="flex-start">
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="文件路径">
                            <el-col :span="20">
                                <el-input v-model="out_path" class="m-2" placeholder="文件夹路径"
                                          :disabled="true"
                                          @click="selectOutDir"
                                          size="default"
                                          clearable>
                                    <template #append>
                                        <el-button @click="selectOutDir" type="default" style="width: 115px"
                                                   class="m-2">点击此处选择
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
                    <el-col :span="12" v-show="checked1">
                        <el-form-item label="递归">
                            <el-switch v-model="recursively"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-show="checked1">
                        <el-form-item label="完成后删除子文件夹">
                            <el-switch v-model="delSubAfter"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="24" v-show="checked2">
                        <el-form-item label="替换文本">
                            <el-col :span="18">
                                <el-input v-model="tobe_replaced" class="m-2" placeholder="替换字符串"
                                          size="default"
                                          clearable>
                                    <template #append>
                                        <el-select v-model="replaceType" class="m-2" placeholder="替换模式"
                                                   @change="replaceTypeChange" style="width: 150px">
                                            <el-option v-for="item in ReplaceTypeOptions" :key="item.value"
                                                       :label="item.label"
                                                       :value="item.value"/>
                                        </el-select>
                                    </template>
                                </el-input>
                            </el-col>
                            <el-col :span="2">
                                <el-input-number size="small" v-model="num" :min="1" :max="40" v-show="numShow"/>

                            </el-col>
                            <el-col :span="18">
                                <el-input v-model="replaced_with" class="m-2" placeholder="替换为"
                                          size="default"
                                          clearable>
                                </el-input>
                            </el-col>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-show="checked4">
                        <el-form-item label="选择AI模型">
                            <el-select v-model="model" class="m-2" placeholder="选择模型" size="default">
                                <el-option v-for="item in ChatModelOptions" :key="item.value" :label="item.label"
                                           :value="item.value"/>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

            </el-space>
        </div>

        <div class="content-box">
            <div style="float: right">
                <el-button @click="startJob(1)" type="primary" link :disabled="!out_path" v-show="checked1">开始文件提级
                </el-button>
                <el-button @click="startJob(2)" type="primary" link :disabled="!out_path" v-show="checked2">替换
                </el-button>
            </div>
        </div>


        <!--        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">-->
        <!--            <el-tab-pane label="任务列表" name="first">-->
        <!--                <el-row :gutter="24">-->
        <!--                    <el-col :span="24">-->
        <!--                        <el-button @click="clearDoneAll" type="primary" link style="float: right">清空列表-->
        <!--                        </el-button>-->
        <!--                    </el-col>-->
        <!--                </el-row>-->
        <!--                <el-row :gutter="24">-->
        <!--                    <el-col :span="24">-->
        <!--                        <VideoCard :videos="videos"/>-->
        <!--                    </el-col>-->
        <!--                </el-row>-->
        <!--            </el-tab-pane>-->
        <!--        </el-tabs>-->
    </el-scrollbar>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {open} from '@tauri-apps/api/dialog'
import {appDataDir} from '@tauri-apps/api/path'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {FConfig, replaceFilename, Result, upgradeFile2Curr} from '../script/filetools'
import {convertFileSrc} from '@tauri-apps/api/tauri'
import {getVideoInfo, Videoo} from "../script/mp4ToImg";
import {open as shellopen} from "@tauri-apps/api/shell";
import {ChatModelOptions, ChatModelVal, MultipleVal, ReplaceTypeOptions} from "../script/constants";
import {sendNotify} from "../script/notification";


const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
const checked5 = ref(false)

const recursively = ref(true)
const delSubAfter = ref(false)

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

const model = ChatModelVal
const replaceType = ref(1)
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

const emptyVideo: Videoo = {};
const vvd = ref(emptyVideo);
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
const path = ref('')
const out_path = ref('')
const tobe_replaced = ref('')
const replaced_with = ref('')
const num = ref(1)
const numShow = ref(false)

/** 选择目录 */
async function select() {
    const selected = await open({
        directory: false,
        multiple: false,
        defaultPath: await appDataDir(),
        filters: [
            {
                name: "Video files",
                extensions: ['mp4', '3gp', 'avi', 'mov', '.m4a']
            }
        ],
    })
    if (selected) {
        console.log(selected)
        let str = selected as string
        // 当选择时才修改path的值
        let currPath = ref('')
        currPath.value = str.split('\\').slice(0, -1).join('\\')
        path.value = currPath.value
        if (!out_path.value) {
            out_path.value = currPath.value;
        }
        console.log('fs', path.value)
        vvd.value = {
            url: convertFileSrc(path.value), percentage: 0,
            name: str,
            codingMode: codingModeVal.value,
            suffix: suffixVal.value,
            stages: [
                {progress: 0, status: '', name: '帧 提 取'},
                {progress: 0, status: '', name: '图 像 放 大'},
                {progress: 0, status: '', name: '合 并 视 频'}
            ]
        };

        const videoInfo = await getVideoInfo(vvd.value).catch(() => {
            console.log("Error when getVideoInfo...")
            // image.status = 'exception'
        }).finally(() => {
        });
        console.log('videoInfo:', videoInfo)

        const videoList: Videoo[] = []
        videoList.push(vvd.value)
        videos.value = videoList;
        console.log('videos', videos.value)
    } else {
        path.value = ''
    }
}

const clearDoneAll = () => {
    console.log("clearDoneAll.")
    videos.value.length = 0;
    vvd.value = emptyVideo;
    path.value = ''
    out_path.value = ''
}

async function selectOutDir() {
    const selected = await open({
        directory: true,
        multiple: false,
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

const res: Result = {failedNum: 0, rcode: -1};

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
                        message: res.failedNum && res.failedNum > 0 ? '批量重命名完成,' + res.failedNum + '个失败' : '文件批量重命名成功',
                        type: 'success'
                    })
                }
                return
            })
            .finally();
    }
}

const replaceTypeChange = (value: number) => {
    replaceType.value = value;
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
