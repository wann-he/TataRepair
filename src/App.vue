<template>
    <el-menu
        data-tauri-drag-region
        mode="horizontal"
        :ellipsis="false"
        @select="select"
    >
        <el-menu-item index="0">
        </el-menu-item>
        <el-menu-item index="1" @click="toggleDark()">
            <div class="titlebar-button" id="titlebar-setting">
                <svg t="1724327384948" class="icon" viewBox="0 0 1024 1024" p-id="3202"
                     width="18" height="18">
                    <path
                        d="M720.024199 351.521545c0 259.827641-221.37703 469.494584-494.203586 473.067991 78.511375 91.05714 197.258887 145.666943 326.238161 145.666942 231.677057 0 418.199246-174.779145 418.199246-388.489122 0-162.588837-109.02069-306.67623-270.391319-363.244579 13.309646 42.857343 20.157499 87.526106 20.157498 132.998768zM643.743261 219.995218c-9.553802-27.055963-9.007669-37.450152 0-49.873508 0 0 28.781462-16.84892 59.647412-7.071485C889.786921 222.09383 1024.000365 387.289747 1024.000365 581.767356 1024.000365 825.967816 812.66442 1024 552.058774 1024c-157.887853 0-297.577931-72.693407-383.223172-184.328239-6.153416-8.018979-9.259549-17.87292-8.788745-27.878694 1.121692-23.846253 21.852395-42.292377 46.303632-41.197757 4.425563 0.198915 8.55452 0.297784 12.385692 0.297784 247.139457 0 447.544497-187.78983 447.544497-419.371549 0-45.950529-7.93188-90.163789-22.53624-131.52515zM337.560199 498.624441l4.35612-26.753471-18.702713-19.486602c-4.374952-4.557389-4.269021-11.840736 0.235403-16.266299a11.31932 11.31932 0 0 1 6.2464-3.126143l25.329287-3.813517 20.8896-44.885333a0.75211 0.75211 0 0 0 0.051788-0.154189l0.015302-0.068266a0.045903 0.045903 0 0 1 0.01177-0.022364 0.009416 0.009416 0 0 1 0.015301 0.003532l20.934326 45.12662 25.361067 3.818225c6.209913 0.935724 10.495411 6.787825 9.571457 13.07189a11.555899 11.555899 0 0 1-3.080239 6.311136l-18.665048 19.49131 4.354943 26.753471c1.021646 6.268763-3.173223 12.187954-9.369012 13.220193a11.254584 11.254584 0 0 1-7.33749-1.277057l-21.754703-12.137343-21.75588 12.137343c-5.497821 3.068469-12.412763 1.045186-15.444745-4.518547a11.620634 11.620634 0 0 1-1.262934-7.424589zM32.549441 178.15246l8.990014-53.652892L3.423114 85.910069a11.767761 11.767761 0 0 1 0.251881-16.84068 12.192662 12.192662 0 0 1 6.654823-3.236782l52.159264-7.630566C74.850057 19.40068 86.55779 0 97.609928 0c11.054492 0 21.675844 19.40068 31.866409 58.202041l52.191044 7.636451c6.617159 0.96868 11.182786 7.026759 10.198805 13.532101a11.833674 11.833674 0 0 1-3.281508 6.534768l-38.03395 38.594207 8.990014 53.652892c1.086382 6.490041-3.382731 12.617563-9.983412 13.687466-2.683586 0.434317-5.436616-0.031779-7.81771-1.32296l-45.695117-24.773738-45.695117 24.773738c-5.857986 3.176754-13.226078 1.082851-16.455798-4.677444a11.737159 11.737159 0 0 1-1.345324-7.685885z"
                        p-id="3203"></path>
                </svg>
            </div>
        </el-menu-item>
        <el-menu-item index="2" @click="select('setting')">
            <div class="titlebar-button" id="titlebar-setting" :class="{ selected: currentSelected === 'setting' }"
            >
                <svg t="1724235288239" class="icon" viewBox="0 0 1024 1024" p-id="1582"
                     width="18" height="18">
                    <path
                        d="M337.333 517.667c77.406 0 141.974 54.967 156.8 127.998l440.534 0.002c17.673 0 32 14.327 32 32 0 17.496-14.042 31.713-31.471 31.995l-0.53 0.005-440.534 0.001C479.307 782.7 414.74 837.667 337.333 837.667S195.36 782.699 180.534 709.668l-99.2-0.001c-17.674 0-32-14.327-32-32 0-17.497 14.041-31.713 31.47-31.996l0.53-0.004 99.2-0.002c14.825-73.03 79.393-127.998 156.8-127.998z m0 64c-53.019 0-96 42.98-96 96 0 53.019 42.981 96 96 96 53.02 0 96-42.981 96-96 0-53.02-42.98-96-96-96z m341.334-405.334c77.406 0 141.974 54.968 156.799 127.999l99.2 0.001c17.674 0 32 14.327 32 32 0 17.497-14.041 31.713-31.47 31.996l-0.53 0.004-99.2 0.003c-14.826 73.03-79.394 127.997-156.8 127.997-77.405 0-141.973-54.967-156.798-127.997l-440.535-0.003c-17.673 0-32-14.327-32-32 0-17.496 14.042-31.713 31.471-31.995l0.53-0.005 440.534-0.001c14.825-73.031 79.393-127.999 156.799-127.999z m0 64c-53.02 0-96 42.981-96 96 0 53.02 42.98 96 96 96 53.019 0 96-42.98 96-96 0-53.019-42.981-96-96-96z"
                        p-id="1583"></path>
                </svg>
            </div>
        </el-menu-item>
        <el-menu-item index="3" @click="minimize">
            <div class="titlebar-button" id="titlebar-minimize">
                <svg t="1660786003641" class="icon" viewBox="0 0 1024 1024" p-id="2149"
                     width="18" height="18">
                    <path
                        d="M65.23884 456.152041 958.760137 456.152041l0 111.695918L65.23884 567.847959 65.23884 456.152041z"
                        p-id="2150"></path>
                </svg>
            </div>
        </el-menu-item>
        <el-menu-item index="4" @click="toggleMaximize">
            <div class="titlebar-button" id="titlebar-maximize">
                <svg t="1660816503973" class="icon" viewBox="0 0 1024 1024"
                     p-id="6853"
                     width="18" height="18">
                    <path
                        d="M928 896H96a53.393333 53.393333 0 0 1-53.333333-53.333333V181.333333a53.393333 53.393333 0 0 1 53.333333-53.333333h832a53.393333 53.393333 0 0 1 53.333333 53.333333v661.333334a53.393333 53.393333 0 0 1-53.333333 53.333333zM96 170.666667a10.666667 10.666667 0 0 0-10.666667 10.666666v661.333334a10.666667 10.666667 0 0 0 10.666667 10.666666h832a10.666667 10.666667 0 0 0 10.666667-10.666666V181.333333a10.666667 10.666667 0 0 0-10.666667-10.666666z"
                        p-id="6854"></path>
                </svg>
            </div>
        </el-menu-item>
        <el-menu-item index="5" @click="closeApp">
            <div class="titlebar-button" id="titlebar-minimize" @click="minimize">
                <svg t="1660786056350" class="icon" viewBox="0 0 1024 1024" p-id="3886"
                     width="18" height="18">
                    <path
                        d="M576 512l277.333333 277.333333-64 64-277.333333-277.333333L234.666667 853.333333 170.666667 789.333333l277.333333-277.333333L170.666667 234.666667 234.666667 170.666667l277.333333 277.333333L789.333333 170.666667 853.333333 234.666667 576 512z"
                        p-id="3887"></path>
                </svg>
            </div>
        </el-menu-item>
    </el-menu>

    <el-container>

        <el-menu
            :ellipsis="false"
            @select="select"
        >
            <el-menu-item index="0">
                <div class="box title" :class="{ selected: currentSelected === 'pic' }" @click="select('pic')">
                    <el-icon>
                        <Picture/>
                    </el-icon>
                    <span class="title-content">图片修复</span>
                </div>
            </el-menu-item>
            <el-menu-item index="1">
                <div class="box title" :class="{ selected: currentSelected === 'video' }" @click="select('video')">
                    <el-icon>
                        <VideoCamera/>
                    </el-icon>
                    <span class="title-content">视频转4K</span>
                </div>
            </el-menu-item>
            <el-menu-item index="2">
                <div class="box title" :class="{ selected: currentSelected === 'file' }" @click="select('file')">
                    <el-icon>
                        <Folder/>
                    </el-icon>
                    <span class="title-content">文件小工具</span>
                </div>
            </el-menu-item>
            <el-menu-item index="3">
                <div class="box title" :class="{ selected: currentSelected === 'media' }" @click="select('media')">
                    <el-icon>
                        <Film/>
                    </el-icon>
                    <span class="title-content">音视频工具</span>
                </div>
            </el-menu-item>
        </el-menu>

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
#svg path {
    fill: var(--af-bg-color);
}

.el-menu--horizontal > .el-menu-item:nth-child(1) {
    margin-right: auto;
}

.box {
    background-color: var(--af-bg-color);
    margin: 0 auto;
    border-radius: 9px;
    //color: #685479;

    .title-content {
        padding-left: 10px;
        color: var(--af-default-font-color);
    }
}

.el-container {
    width: 100vw;
    height: 90vh;
    // padding-top: 30px;
}

.title {
    width: 170px;
    height: 50px;
    margin: 20px 0;
    text-align: center;
    line-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

//.select-box {
//    height: 150px;
//    display: flex;
//    align-items: center;
//}

%btn {
    width: 150px;
    height: 50px;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
    color: #111;
}

//.select-button {
//    background-color: #2d3333;
//    @extend %btn;
//
//    &:hover {
//        box-shadow: 0px 0px 5px #01c2ce;
//    }
//}

.selected {
    //background-color: #01c2ce; /* 选择的颜色 */
}

//.default-button {
//    background-color: #555;
//    @extend %btn;
//
//    &:hover {
//        box-shadow: 0px 0px 5px #444;
//    }
//}

//.start-button {
//    background-color: #409eff;
//    @extend %btn;
//
//    &:hover {
//        box-shadow: 0px 0px 5px #409eff;
//    }
//}

.text-red {
    color: red;
}

</style>
