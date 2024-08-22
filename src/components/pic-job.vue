<template>
    <el-scrollbar>
        <div class="content-box content-select-box">
            <div class="content-box select-button" :class="allDisabled ? 'disable-button' : '' " @click="select">+ 选择图片</div>

            <div class="content-box" :class="[path && !allDisabled? 'start-button' : 'default-button disable-button']" @click="start">开始转码</div>
        </div>
        <div class="content-box path-box">
            <el-row :gutter="24">
                <el-col :span="12">
                    <el-form-item label="模型">
                        <el-select v-model="model" class="m-2" placeholder="选择模型" size="default" :disabled="allDisabled">
                            <el-option v-for="item in ModelOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="放大倍数">
                        <el-select v-model="multiple" class="m-2" placeholder="放大倍数" size="default" :disabled="allDisabled">
                            <el-option v-for="item in MultipleOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="24">
                <el-col :span="20">
                    <el-input v-model="path" class="m-2" placeholder="输出目录" :disabled="true" size="default"
                              clearable>
                        <template #prepend>
                            <el-button @click="selectOutDir" type="primary" :disabled="allDisabled">选择输出目录</el-button>
                        </template>
                    </el-input>
                </el-col>
                <el-button @click="openOutDir" type="primary" link :disabled="!path">打开
                </el-button>
            </el-row>


        </div>


        <el-row>
            <el-col :span="24">
                <div class="grid-content ep-bg-purple-dark"/>
                <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
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
                                <!--                                <div style="text-align: right">-->
                                <!--                                    <el-button @click="clearDoneAll" type="primary" link style="float: right">清空列表</el-button>-->
                                <!--                                </div>-->
                                <el-button @click="clearDoneAll" type="primary" link style="float: right" :disabled="allDisabled">清空列表
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
import {computed, ref} from 'vue'
import {open} from '@tauri-apps/api/dialog'
import {appDataDir, appDir, desktopDir} from '@tauri-apps/api/path'
import {open as shellopen} from '@tauri-apps/api/shell';
import {convertFileSrc} from '@tauri-apps/api/tauri';
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {Image, imgTo4k} from "../script/mp4ToImg";
import {Delete} from "@element-plus/icons-vue";
import {ModelOptions, ModelVal, MultipleOptions, MultipleVal} from "../script/constants";
import {sendNotify} from "../script/notification";
import {basename} from "pathe";

const allDisabled = ref(false)
const activeName = ref('first')
const scheduleList = ref<string[]>([])
const completeList = ref<string[]>([])
const model = ModelVal
const multiple = MultipleVal

/**
 * 切换面板
 * @param tab
 * @param event
 */
const handleClick = (tab: TabsPaneContext, event: Event) => {
}
const fit = ref('contain')
/** 选择的目录路径 */
const path = ref('')

const imgArr: Image[] = [];
const imgs = ref(imgArr);

const imgArrDone: Image[] = [];
const imgsDone = ref(imgArrDone);

const now = new Date()
const mConfig = computed(() => {
    return {
        model: model.value,
        outscale: multiple.value,
        prefix: 'tata4kk_',
    };
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
                extensions: ['png', 'jpg', 'jpeg']
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
        defaultPath: await appDataDir(),
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
}

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    // return false
    return true
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
    console.log("openOutDir.")
    shellopen(path.value);
    // invoke<string[]>('open_out_dir', {path: path.value})
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
