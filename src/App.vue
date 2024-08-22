<template>
    <div class="clearfix">
        <div data-tauri-drag-region class="titlebar">
            <div data-tauri-drag-region class="title-aside"></div>
            <div>
                <div class="titlebar-button" id="titlebar-setting" @click="toggleDark()">
                    <img src="./assets/暗黑.svg" alt="minimize"/>
                </div>
                <div class="titlebar-button" id="titlebar-setting" :class="{ selected: currentSelected === 'setting' }"
                     @click="select('setting')">
                    <img src="./assets/设置.svg" alt="minimize"/>
                </div>
                <div class="titlebar-button" id="titlebar-minimize" @click="minimize">
                    <img src="./assets/最小化.svg" alt="minimize"/>
                </div>
                <div class="titlebar-button" id="titlebar-maximize" @click="toggleMaximize">
                    <img :src="isMax ? remin : max" alt="maximize"/>
                </div>
                <div class="titlebar-button" id="titlebar-close" @click="closeApp">
                    <img src="./assets/关闭.svg" alt="close"/>
                </div>
            </div>
        </div>
    </div>
    <el-container>
        <el-aside>
            <div class="box title" :class="{ selected: currentSelected === 'pic' }" @click="select('pic')">
                <el-icon>
                    <Picture/>
                </el-icon>
                <span class="title-content">图片修复</span>
            </div>
            <div class="box title" :class="{ selected: currentSelected === 'video' }" @click="select('video')">
                <el-icon>
                    <VideoCamera/>
                </el-icon>
                <span class="title-content">视频转4K</span>
            </div>
            <div class="box title" :class="{ selected: currentSelected === 'file' }" @click="select('file')">
                <el-icon>
                    <Folder/>
                </el-icon>
                <span class="title-content">文件小工具</span>
            </div>
            <div class="box title" :class="{ selected: currentSelected === 'media' }" @click="select('media')">
                <el-icon>
                    <Film/>
                </el-icon>
                <span class="title-content">音视频工具</span>
            </div>
        </el-aside>
        <el-main>
            <router-view v-slot="{ Component }">
                <KeepAlive>
                    <component :is="Component"></component>
                </KeepAlive>
            </router-view>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {closeApp, minimize} from './system'
import max from './assets/最大化.svg'
import remin from './assets/还原.svg'
import {appWindow} from '@tauri-apps/api/window'
import {useRouter} from 'vue-router'
import {useDark, useToggle} from '@vueuse/core'


const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()


const currentSelected = ref('pic')

/** 初始化时要做的事情 */
async function init() {
    useToggle(true)
}


init()

function goToCopyright() {
    router.push({path: '/copyright', replace: true})
}

function go2Video() {
    router.push({path: '/video-job', replace: false})
}

function go2Pic() {
    router.push({path: '/pic-job', replace: false})
}

function go2File() {
    router.push({path: '/file-job', replace: false})
}

function go2Media() {
    router.push({path: '/media', replace: false})
}

function go2Setting() {
    router.push({path: '/setting', replace: true})
}

/**
 * 切换面板
 * @param tab
 * @param event
 */
/** 当前软件是否最大化 */
const isMax = ref(false)

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    return false
    // return true
}

function toggleMaximize() {
    appWindow.toggleMaximize()
    isMax.value = !isMax.value
}

function select(type: 'pic' | 'video' | 'file' | 'media' | 'setting') {
    currentSelected.value = type;
    switch (type) {
        case 'pic':
            go2Pic();
            break;
        case 'video':
            go2Video();
            break;
        case 'file':
            go2File();
            break;
        case 'media':
            go2Media();
            break;
        case 'setting':
            go2Setting();
            break;
        default:
            break;
    }
}
</script>

<style scoped lang="scss">
.box {
    background-color: #21242a;
    margin: 0 auto;
    border-radius: 9px;
    color: #685479;

    .title-content {
        padding-left: 10px;
        color: #dadee4;
    }
}

.el-container {
    width: 100vw;
    height: 100vh;
    // padding-top: 30px;
}

.title {
    width: 170px;
    height: 50px;
    margin-top: 20px;
    text-align: center;
    line-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.select-box {
    height: 150px;
    display: flex;
    align-items: center;
}

%btn {
    width: 150px;
    height: 50px;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
    color: #111;
}

.select-button {
    background-color: #2d3333;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #01c2ce;
    }
}

.selected {
    background-color: #01c2ce; /* 选择的颜色 */
}

.default-button {
    background-color: #555;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #444;
    }
}

.start-button {
    background-color: #409eff;
    @extend %btn;

    &:hover {
        box-shadow: 0px 0px 5px #409eff;
    }
}

.text-red {
    color: red;
}

</style>
