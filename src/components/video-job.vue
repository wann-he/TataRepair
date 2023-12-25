<template>
    <el-scrollbar>
        <h3>视频转4K</h3>
        <div class="tip">注意: 视频名不要有空格</div>
        <div class="box select-box">
            <div class="box select-button" @click="select">+ 选择视频</div>

            <div class="box" :class="[path ? 'start-button' : 'default-button']" @click="start">开始转码</div>
        </div>
        <div class="box path-box">
            <!--            <el-form-->
            <!--                :label-position="labelPosition"-->
            <!--                label-width="80px"-->
            <!--            >-->
            <el-row :gutter="24">
                <el-col :span="12">
                    <el-form-item label="选择模型">
                        <el-select v-model="model" class="m-2" placeholder="选择模型" size="default">
                            <el-option v-for="item in ModelOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="放大倍数">
                        <el-select v-model="multiple" class="m-2" placeholder="放大倍数" size="default">
                            <el-option v-for="item in MultipleOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="编码方式">
                        <el-select v-model="codingModeVal" class="m-2" placeholder="编码方式" size="default">
                            <el-option v-for="item in CodingModeOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="视频后缀">
                        <el-select v-model="suffixVal" class="m-2" placeholder="后缀" size="default">
                            <el-option v-for="item in suffixOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="多线程">
                        <el-radio-group v-model="thread">
                            <el-radio-button label="1">不使用</el-radio-button>
                            <el-radio-button label="2">线程数：2</el-radio-button>
                            <el-radio-button label="5">线程数：5</el-radio-button>
                            <el-radio-button label="10">线程数：10</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="24">
                <el-col :span="20">
                    <el-input v-model="out_path" class="m-2" placeholder="输出目录" :disabled="true" size="default"
                              clearable>
                        <template #prepend>
                            <el-button @click="selectOutDir" type="primary">选择输出目录</el-button>
                        </template>
                    </el-input>
                </el-col>
                <el-button @click="openOutDir" type="primary" link :disabled="!out_path">打开
                </el-button>
            </el-row>
            <!--            </el-form>-->
        </div>

        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane label="任务列表" name="first">
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-button @click="clearDoneAll" type="primary" link style="float: right">清空列表
                        </el-button>
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="24">
                        <VideoCard :videos="videos"/>
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
import {appDir} from '@tauri-apps/api/path'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {convertFileSrc} from '@tauri-apps/api/tauri'
import {
    getVideoInfo,
    Image,
    imgTo4k,
    MConfig,
    merge2Video,
    mp4ToImgV2,
    ThreadPool,
    TMP_4K_DIR,
    Videoo
} from "../script/mp4ToImg";
import VideoCard from "./video-card.vue";
import {open as shellopen} from "@tauri-apps/api/shell";
import {CodingModeOptions, ModelOptions, ModelVal, MultipleOptions, MultipleVal} from "../script/constants";


const model = ModelVal
const multiple = MultipleVal
const codingModeVal = ref<'libx264' | 'hevc_nvenc'>('libx264')

const suffixVal = ref<'_4k' | ''>('_4k')
const suffixOptions = [
    {
        value: '_4k',
        label: '_4k(为原视频名添加_4k后缀)',
    },
    {
        value: '',
        label: '保持原视频名',
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

/** 选择目录 */
async function select() {
    const selected = await open({
        directory: false,
        multiple: false,
        defaultPath: await appDir(),
        filters: [
            {
                name: "Video files",
                extensions: ['mp4', '3gp', 'avi']
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

let basePath = ref('')

async function start() {
    const arr = path.value.split('/')
    console.log(arr)
    console.log(new Date());
    // 如果没有选择，则退出报错
    if (!path.value || !vvd.value.name) {
        ElMessage({
            message: '未选择文件|目录',
            type: 'success'
        })
        return
    }

    basePath.value = path.value.replace('/input', '')
    console.log('basePath:' + basePath.value)
    console.log(`开始时间：${new Date()}`);

    const result = await mp4ToImgV2(null, basePath.value, vvd.value).catch(() => {
        console.log("Error when imgTo4k...")
        // image.status = 'exception'
    }).finally(() => {
    })
    console.log("result ====================>")
    console.log(result)
    if (result.rcode !== 0) {
        ElMessage({
            message: '转换异常',
            type: 'error'
        })
        return
    }
    if (vvd.value && vvd.value.stages) {
        vvd.value.stages[0].progress = 100;
        vvd.value.stages[0].status = 'success';
    }
    // // 处理视频帧
    const mConfig: MConfig = {
        model: model.value,
        outscale: multiple.value,
        outpath: TMP_4K_DIR,
    };
    const imgs: Image[] = result.images;
    console.log('basePath:' + basePath.value)
    // 3.
    const imgSize = imgs.length;
    if (thread.value == 1) {
        console.log('不使用多线程.')
        for (let i = 0; i < imgSize; i++) {
            const res = await imgTo4k(mConfig, basePath.value, imgs[i])
                .catch(() => {
                    console.log("Error when processing img24k...");
                    imgs[i].status = 'Exception';
                });
            if (res?.rcode == 0) {
                const progress = (i / imgSize) * 100;  // 将小数转为百分比
                console.log(`Progress: ${progress}%`);
                if (vvd.value && vvd.value.stages) {
                    vvd.value.stages[1].progress = progress;
                }
            }

        }
        if (vvd.value && vvd.value.stages) {
            vvd.value.stages[1].progress = 100;
            vvd.value.stages[1].status = 'success';
        }
        await doMerge(mConfig);

    } else {
        console.log(`多线程运行 ${thread.value}`)
        // 创建新的线程池实例，限制并发任务数为5
        const threadPool = new ThreadPool(thread.value);
        // 加载到线程池中的任务
        for (let i = 0; i < imgSize; i++) {
            threadPool.run(() =>
                imgTo4k(mConfig, basePath.value, imgs[i])
                    .catch(() => {
                        console.log("Error when processing img24k...");
                        imgs[i].status = 'Exception';
                    })
            );
        }
        const progressInterval = setInterval(() => {
            const progress = threadPool.getProgress() * 100;  // 将小数转为百分比
            console.log(`Progress: ${progress}%`);
            if (vvd.value && vvd.value.stages) {
                vvd.value.stages[1].progress = progress;
            }
        }, 1000);  // 每一秒获取一次进度

        // 等待所有任务完成后再执行其他操作
        threadPool.isDone().then(async () => {
            console.log("All tasks in the thread pool have completed.");
            clearInterval(progressInterval);  // 停止定时器
            if (vvd.value && vvd.value.stages) {
                vvd.value.stages[1].progress = 100;
                vvd.value.stages[1].status = 'success';
            }
            // 在这执行后续的操作代码。
            await doMerge(mConfig);
        });
    }
    return
}

async function doMerge(mConfig: MConfig) {
    // 在这执行后续的操作代码。
    const mRes = await merge2Video(mConfig, basePath.value, out_path.value, vvd.value).catch(() => {
        console.log("Error when merge2Video...")
    }).finally(() => {
    })
    if (vvd.value && vvd.value.stages) {
        vvd.value.stages[2].progress = 100;
        vvd.value.stages[2].status = 'success';
    }
    console.log(`merge2Video result ==> ${mRes}`)
    console.log(`完成时间：${new Date()}`);
}

async function selectOutDir() {
    const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: await appDir(),
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
    height: 200px;
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

</style>
