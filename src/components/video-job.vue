<template>
    <el-scrollbar>
        <div class="content-box content-select-box">
            <div @click="select" class="box select-button" :class="allDisabled ? 'disable-button' : '' ">+ 选择视频
            </div>

            <div class="content-box" @click="start"
                 :class="[basePath && !allDisabled ? 'start-button' : 'default-button disable-button']"
            >开始转码
            </div>
        </div>
        <div class="content-box path-box">
            <el-row :gutter="24">
                <el-col :span="12">
                    <el-form-item label="选择模型">
                        <el-select v-model="model" class="m-2" placeholder="选择模型" size="default"
                                   :disabled="allDisabled">
                            <el-option v-for="item in ModelOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="放大倍数">
                        <el-select v-model="multiple" class="m-2" placeholder="放大倍数" size="default"
                                   :disabled="allDisabled">
                            <el-option v-for="item in MultipleOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="编码方式">
                        <el-select v-model="codingModeVal" class="m-2" placeholder="编码方式" size="default"
                                   :disabled="allDisabled">
                            <el-option v-for="item in CodingModeOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="视频后缀">
                        <el-select v-model="suffixVal" class="m-2" placeholder="后缀" size="default"
                                   :disabled="allDisabled">
                            <el-option v-for="item in suffixOptions" :key="item.value" :label="item.label"
                                       :value="item.value"/>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="多线程">
                        <el-radio-group v-model="thread" :disabled="allDisabled">
                            <el-radio-button value="1">不使用</el-radio-button>
                            <el-radio-button value="2">线程数：2</el-radio-button>
                            <el-radio-button value="5">线程数：5</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="24">
                <el-col :span="20">
                    <el-input v-model="out_path" class="m-2" placeholder="输出目录" :disabled="true" size="default"
                              clearable>
                        <template #prepend>
                            <el-button @click="selectOutDir" type="primary" :disabled="allDisabled">选择输出目录</el-button>
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
                        <el-button @click="clearDoneAll" type="primary" link style="float: right"
                                   :disabled="allDisabled">清空列表
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
import {appDataDir} from '@tauri-apps/api/path'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {convertFileSrc} from '@tauri-apps/api/tauri'
import {
    Image,
    imgTo4k,
    MConfig,
    merge2Video,
    ThreadPool,
    TMP_4K_DIR,
    TMP_IMG_DIR,
    video2Img,
    Videoo
} from "../script/mp4ToImg";
import VideoCard from "./video-card.vue";
import {open as shellopen} from "@tauri-apps/api/shell";
import {CodingModeOptions, ModelOptions, ModelVal, MultipleOptions, MultipleVal} from "../script/constants";
import {basename, dirname, extname, format, parse, relative, toNamespacedPath} from "pathe";
import {createDir, readDir, removeDir} from "@tauri-apps/api/fs";
import {path} from "@tauri-apps/api";
import {sendNotify} from "../script/notification";


const allDisabled = ref(false)
const model = ModelVal
const multiple = MultipleVal
const codingModeVal = ref<'libx264' | 'hevc_nvenc'>('libx264')

const suffixVal = ref<'_tata4k'>('_tata4k')
const suffixOptions = [
    {
        value: '_tata4k',
        label: '_tata4k(为原视频名添加_tata4k后缀)',
    }
]
const activeName = ref('first')
const labelPosition = ref('right')
const thread = ref(1);

const emptyVideo: Videoo = {
    url: '',
    name: '',
    path: ''
};
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
const basePath = ref('')
const out_path = ref('')

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
    if (!selected) {
        return;
    }
    console.log(selected)
    let str = selected as string
    // 当选择时才修改path的值
    let currPath = ref('')
    currPath.value = str.split('\\').slice(0, -1).join('\\')
    basePath.value = currPath.value
    if (!out_path.value) {
        out_path.value = currPath.value;
    }
    console.log('fs', basePath.value)
    vvd.value = {
        path: str,
        url: convertFileSrc(basePath.value),
        percentage: 0,
        name: basename(str),
        codingMode: codingModeVal.value,
        suffix: suffixVal.value,
        stages: [
            {progress: 0, status: '', name: '帧 提 取'},
            {progress: 0, status: '', name: '图 像 放 大'},
            {progress: 0, status: '', name: '合 并 视 频'}
        ]
    };

    // const videoInfo = await getVideoInfo(vvd.value).catch((reason) => {
    //     console.log("Error when getVideoInfo...")
    //     console.log(reason)
    //     // image.status = 'exception'
    // }).finally(() => {
    // });
    // console.log('videoInfo:', videoInfo)

    const videoList: Videoo[] = []
    videoList.push(vvd.value)
    videos.value = videoList;
    console.log('videos', videos.value)
}

const clearDoneAll = () => {
    console.log("clearDoneAll.")
    videos.value.length = 0;
    vvd.value = emptyVideo;
    basePath.value = ''
    out_path.value = ''
    allDisabled.value = false;
}

async function start() {
    const arr = basePath.value.split('/')
    console.log(new Date());
    console.log(arr)
    console.log('basePath:', basePath.value)
    // 如果没有选择，则退出报错
    if (!basePath.value || !vvd.value.path) {
        ElMessage({
            message: '未选择文件|目录',
            type: 'success'
        })
        return
    }

    allDisabled.value = true;

    // 处理视频帧
    let mConfig: MConfig = {
        model: model.value,
        outscale: multiple.value,
        outpath: TMP_4K_DIR,
    };
    console.log(`开始时间：${new Date()}`);
    let imgs: Image[] = [];
    const res = await video2Img(basePath.value, vvd.value);
    console.log("video2Img_res:", res)
    if (res.rcode !== 0) {
        await sendNotify(res.msg || `【${vvd.value.name}】转换异常`)
        allDisabled.value = false;
        return;
    }
    imgs = res.data;
    if (vvd.value && vvd.value.stages) {
        vvd.value.stages[0].progress = 100;
        vvd.value.stages[0].status = 'success';
    }
    const imgSize = imgs.length;
    if (imgSize <= 0) {
        console.log("imgSize:", imgSize)
        await sendNotify(`【${vvd.value.name}】帧提取异常`)
        allDisabled.value = false;
        return;
    }
    // 3.
    if (thread.value == 1) {
        console.log('不使用多线程.')
        for (let i = 0; i < imgSize; i++) {
            await imgTo4k(mConfig, basePath.value, imgs[i])
                .then((res) => {
                    if (res?.rcode == 0) {
                        const progress = (i / imgSize) * 100;  // 将小数转为百分比
                        console.log(`Progress: ${progress}%`);
                        if (vvd.value && vvd.value.stages) {
                            vvd.value.stages[1].progress = progress;
                        }
                    }
                })
                .catch((reason) => {
                    console.log("Error when processing imgTo4k,reason:", reason);
                    imgs[i].status = 'Exception';
                });
        }
        if (vvd.value && vvd.value.stages) {
            vvd.value.stages[1].progress = 100;
            vvd.value.stages[1].status = 'success';
        }
        await doMerge(basePath.value, out_path.value, vvd.value);
    } else {
        console.log(`多线程运行 ${thread.value}`)
        const o_path = mConfig.outpath || '';
        const img_prefix = mConfig.prefix || '';
        const tmp_out_path = await path.join(basePath.value, o_path);
        await readDir(tmp_out_path).catch(() => {
            createDir(tmp_out_path)
        })
        // 创建新的线程池实例，限制并发任务数为5
        const threadPool = new ThreadPool(thread.value);
        // 加载到线程池中的任务
        for (let i = 0; i < imgSize; i++) {
            threadPool.run(() =>
                imgTo4k(mConfig, basePath.value, imgs[i])
                    .catch((reason) => {
                        console.log("Error when processing threadPool_imgTo4k,reason:", reason);
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
        }, 2000);  // 每2秒获取一次进度

        // 等待所有任务完成后再执行其他操作
        threadPool.isDone().then(async () => {
            console.log("All tasks in the thread pool have completed.");
            clearInterval(progressInterval);  // 停止定时器
            if (vvd.value && vvd.value.stages) {
                vvd.value.stages[1].progress = 100;
                vvd.value.stages[1].status = 'success';
            }
            // 在这执行后续的操作代码。
            await doMerge(basePath.value, out_path.value, vvd.value);
        });
    }
    return
}

async function doMerge(base_path: string, out_path: string, video: Videoo) {
    // 在这执行后续的操作代码。
    const img_path = await path.join(base_path, TMP_4K_DIR)

    const mergeRes = await merge2Video(img_path, out_path, video).catch((reason) => {
        console.log("Error when merge2Video,reason:", reason)
    }).finally(() => {
    })
    if (video && video.stages && video.stages.length == 3) {
        video.stages[2].progress = 100;
        video.stages[2].status = 'success';
    }
    console.log('merge2Video result :', mergeRes)
    console.log(`完成时间：${new Date()}`);

    allDisabled.value = false;

    await sendNotify(`【${video.name}】视频转4k-完成!`)

    // 删除临时文件夹目录
    const tmp_dir_1 = await path.join(basePath.value, TMP_IMG_DIR);
    const tmp_dir_2 = await path.join(basePath.value, TMP_4K_DIR);
    await removeDir(tmp_dir_1, {recursive: true}).catch((reason) => {
        console.log(`删除临时文件夹${TMP_IMG_DIR}失败：${reason}`)
    })
    await removeDir(tmp_dir_2, {recursive: true}).catch((reason) => {
        console.log(`删除临时文件夹${TMP_4K_DIR}失败：${reason}`)
    })

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

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    // return false
    return true
}
</script>

<style scoped lang="scss">

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

.disable-button {
    cursor: not-allowed;
    pointer-events: none;
}

</style>
