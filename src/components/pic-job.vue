<template>
    <el-scrollbar>
        <div
            ref="dropArea"
            @dragover.prevent
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop"
            :class="{'drag-over': isDragOver}"
            class="drop-area"
        >
            <div class="content-box path-box">
                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="模型">
                            <el-select v-model="model" class="m-2" placeholder="选择模型" size="default"
                                       :disabled="allDisabled" @change="modelSelected">
                                <el-option v-for="item in ModelOptions" :key="item.value" :label="item.label"
                                           :value="item.value"/>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="放大倍数">
                            <el-radio-group v-model="multiple" :disabled="allDisabled">
                                <el-radio-button v-for="item in scaleOptions" :disabled="item.disabled"
                                                 :value="item.value" :key="item.value" :label="item.label"/>
                            </el-radio-group>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="20">
                        <el-input v-model="path" class="m-2" placeholder="输出目录" :disabled="true" size="default"
                                  clearable>
                            <template #prepend>
                                <el-button @click="selectOutDir" type="primary" :disabled="allDisabled">选择输出目录
                                </el-button>
                            </template>
                        </el-input>
                    </el-col>
                    <el-button @click="openOutDir" type="primary" link :disabled="!path">打开
                    </el-button>
                </el-row>
            </div>

            <div class="right-top-icon-container">
                <div style="display: flex; align-items: center;">
                    <el-text size="small" type="info">可拖拽至此区域或</el-text>
                    <el-button size="small" type="primary" text @click="select" :disabled="allDisabled">
                        <el-icon>
                            <Picture/>
                        </el-icon>&nbsp;点击选择
                    </el-button>
                </div>
                <el-button type="primary" color="#626aef" plain @click="start" :disabled="allDisabled">
                    <el-icon>
                        <VideoPlay/>
                    </el-icon>&nbsp;开&nbsp;始
                </el-button>
            </div>
        </div>

        <el-row>
            <el-col :span="24">
                <div class="grid-content ep-bg-purple-dark"/>
                <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick" id="jobTab">
                    <el-tab-pane label="任务列表" name="first">
                        <div class="image-list">
                            <el-card
                                v-for="(image, index) in imgs"
                                :key="index"
                                class="image-item"
                                :body-style="{ padding: '0px', marginBottom: '1px' }"
                            >
                                <div>
                                    <el-image style="width: 100%; height: 100px" :src="image.url" :fit="fit"/>
                                    <div class="bottom card-header">
                                        <el-progress :text-inside="true" :status="image.status"
                                                     :percentage="image.percentage"
                                                     v-show="image.percentage && image.percentage > 0"/>
                                        <el-button type="danger" :icon="Delete" circle @click="deleteImage(index)"/>
                                    </div>
                                </div>
                            </el-card>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="完成" name="second">
                        <el-row :gutter="24">
                            <el-col :span="24">
                                <el-button @click="clearDoneAll" type="primary" link style="float: right"
                                           :disabled="allDisabled">清空列表
                                </el-button>
                            </el-col>
                        </el-row>
                        <el-row>
                            <div class="image-list">
                                <el-card
                                    v-for="(image, index) in imgsDone"
                                    :key="index"
                                    class="image-item"
                                    :body-style="{ padding: '0px', marginBottom: '1px' }"
                                >
                                    <div v-if="image.status == 'success'">
                                        <el-image style="width: 100%; height: 100px" :src="image.url" :fit="fit"/>
                                        <div class="bottom card-header">
                                            <el-progress :text-inside="true" :status="image.status"
                                                         :percentage="image.percentage"
                                                         v-show="image.percentage && image.percentage > 0"/>
                                        </div>
                                    </div>
                                </el-card>
                            </div>
                        </el-row>

                    </el-tab-pane>
                </el-tabs>
            </el-col>
        </el-row>
    </el-scrollbar>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {open} from '@tauri-apps/plugin-dialog'
import {desktopDir, join} from '@tauri-apps/api/path'
import {open as shellopen} from '@tauri-apps/plugin-shell';
import {convertFileSrc} from '@tauri-apps/api/core';
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {Image, imgTo4k} from "../script/mp4ToImg";
import {Delete} from "@element-plus/icons-vue";
import {ModelOptions, ModelVal, MultipleVal, ScaleDefaultOptions} from "../script/constants";
import {sendNotify} from "../script/notification";
import {basename} from "pathe";
import {remove, writeFile} from "@tauri-apps/plugin-fs";
import {createTempDirectory} from "../script/filetools";
import {ElLoading} from 'element-plus'

const allDisabled = ref(false)
const activeName = ref('first')
const model = ModelVal
const multiple = MultipleVal


const fit = ref('contain')
/** 选择的目录路径 */
const path = ref('')
const tempDir = ref('')
const imgArr: Image[] = [];
const imgs = ref(imgArr);

const imgArrDone: Image[] = [];
const imgsDone = ref(imgArrDone);

const mConfig = computed(() => {
    return {
        model: model.value,
        outscale: multiple.value,
        prefix: 'tata4kk_',
        is_video_job: false,
    };
});

const scaleOptions = ref(ScaleDefaultOptions)

/**
 * 切换面板
 * @param tab
 * @param event
 */
const handleClick = (tab: TabsPaneContext, event: Event) => {
}

const dropArea = ref<HTMLElement | null>(null);
const isDragOver = ref(false);
const files = ref<File[]>([]);

const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!isDragOver.value) {
        isDragOver.value = true;
    }
};

const handleDragLeave = () => {
    isDragOver.value = false;
};

const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    isDragOver.value = false;

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
        const loadingInstance = ElLoading.service({target: '#jobTab', text: '加载中...'})


        files.value = Array.from(droppedFiles);
        tempDir.value = await createTempDirectory();

        const imgArr: Image[] = [];
        for (let i = 0; i < files.value.length; i++) {
            const file = files.value[i];
            console.log("==================")
            console.log(file)
            console.log(URL.createObjectURL(file))
            console.log("==================")
            if (file.type.startsWith('image/')) {
                const tempFilePath = await join(tempDir.value, file.name);
                await writeFile(tempFilePath, await file.arrayBuffer());
                imgArr.push({url: URL.createObjectURL(file), percentage: 0, name: tempFilePath});
            }
        }
        console.log('path:' + path.value);
        imgs.value = imgArr;
        loadingInstance.close();
        console.log('imgs', imgs.value);
    }
};

onMounted(() => {
    const element = dropArea.value;
    if (element) {
        element.addEventListener('dragover', handleDragOver);
    }
});

/** 选择目录 */
async function select() {
    const selected = await open({
        directory: false,
        multiple: true,
        defaultPath: await desktopDir(),
        filters: [
            {
                name: "Image files",
                extensions: ['png', 'jpg', 'jpeg', 'heic']
            }
        ],
    })
    if (selected) {
        let currPath = ref('')
        const imgArr: Image[] = []
        for (let str of selected) {
            imgArr.push({url: convertFileSrc(str), percentage: 0, name: str})
            currPath.value = str.split('\\').slice(0, -1).join('\\')
        }
        if (!path.value) {
            path.value = currPath.value
        }
        console.log('path:' + path.value)
        // 当选择时才修改path的值
        console.log(selected)

        imgs.value = imgArr;
        console.log('imgs', imgs.value)
    } else {
        // images.value = []
        imgs.value = []
    }
}

async function selectOutDir() {
    const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: await desktopDir(),
    })
    if (selected) {
        path.value = selected.toString()
        console.log('path:' + path.value)
        // 当选择时才修改path的值
        console.log(selected)
    }
}

async function start() {
    if (!path.value) {
        ElMessage({
            message: '请选择输出目录',
            type: 'error'
        })
        return
    }

    if (imgs.value.length === 0) return

    allDisabled.value = true;

    console.log('path:' + path.value)
    let failedNum = 0;
    for (let i = imgs.value.length - 1; i >= 0; i--) {
        const image = imgs.value[i]

        console.log(image)

        const result = await imgTo4k(mConfig.value, path.value, image).catch((reason) => {
            console.log("error when img24k...", reason)
            failedNum++;
            image.status = 'exception'
            sendNotify('转换异常:' + basename(image.name))
        }).finally(() => {
            if (image.status == 'success') {
                imgsDone.value.push(image)
                imgs.value.splice(i, 1)
            }

        })
        console.log("result ====================>", result)
    }
    await sendNotify(failedNum > 0 ? '转换完成,' + failedNum + '个失败' : '图片修复成功')
    allDisabled.value = false;

    // 任务完成后删除临时目录
    await remove(tempDir.value, {recursive: true});
}

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    // return false
    return false
}

const deleteImage = (index: number) => {
    console.log("deleteImage：" + index)
    // images.value.splice(index,1)
    imgs.value.splice(index, 1)
}

const clearDoneAll = () => {
    console.log("clearDoneAll.")
    imgsDone.value.length = 0;
    allDisabled.value = false;
}

const openOutDir = () => {
    console.log(`openOutDir==> ${path.value}`)
    console.log(`openOutDir==> ${path.value.replaceAll("\\",'/')}`)
    shellopen(path.value);
    // invoke<string[]>('open_out_dir', {path: path.value})
}

const modelSelected = (val: string) => {
    console.log("modelSelected:", val)
    if (val === 'realesr-general-x4v3' || val === 'realesr-animevideov3' || val === 'srmd') {
        scaleOptions.value = [
            {
                value: 2,
                label: '2倍',
                disabled: false
            }, {
                value: 3,
                label: '3倍',
                disabled: false
            },
            {
                value: 4,
                label: '4倍',
                disabled: false
            }
        ]
    } else {
        scaleOptions.value = ScaleDefaultOptions
    }
}

</script>

<style scoped lang="scss">

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
    height: 100px;
    //display: flex;
    //align-items: center;
    padding: 5px 15px;
    margin-top: 50px;
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

.tip {
    color: red;
    margin: 50px auto;
    text-align: center;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
}

.image-item {
    // flex-basis: 10%;
    margin-bottom: 10px;
    margin-right: 10px;
    max-width: 150px;
    max-height: 200px;
}

.image-item img {
    max-width: 150px;
    max-height: 150px;
    width: 100%;
    display: block;
}


.el-button {
    float: right;
}

.disable-button {
    cursor: not-allowed;
    pointer-events: none;
}
</style>
