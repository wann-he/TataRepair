<template>
    <!--    <el-watermark :font="font" :rotate="-25"-->
    <!--                  :gap="[225,225]" :offset="[125,125]" :content="waterMark">-->
    <!--    </el-watermark>-->
    <el-menu
        data-tauri-drag-region
        mode="horizontal"
        :ellipsis="false"
        @select="select"
    >
        <el-menu-item index="0" :disabled="true">
            <el-text size="medium" type="info" style="opacity: 0.5;">
                {{ waterMark }}
            </el-text>
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
        <el-menu-item index="2" @click="minimize">
            <div class="titlebar-button" id="titlebar-minimize">
                <svg t="1660786003641" class="icon" viewBox="0 0 1024 1024" p-id="2149"
                     width="18" height="18">
                    <path
                        d="M65.23884 456.152041 958.760137 456.152041l0 111.695918L65.23884 567.847959 65.23884 456.152041z"
                        p-id="2150"></path>
                </svg>
            </div>
        </el-menu-item>
        <el-menu-item index="3" @click="toggleMaximize">
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
        <!--        <div>-->
        <el-menu
            mode="vertical"
            :ellipsis="false"
            class="custom-vertical-menu"
            @select="select"
            style="height: 100%"
            :collapse="isCollapse"
        >
            <div class="top-aligned">
                <el-menu-item index="0" @click="select('pic')">
                    <!--                        <div class="box title" :class="{ selected: currentSelected === 'pic' }" @click="select('pic')">-->
                    <el-icon>
                        <Picture/>
                    </el-icon>
                    <template #title>图片修复</template>
                    <!--                        </div>-->
                </el-menu-item>
                <el-menu-item index="1" @click="select('video')">
                    <el-icon>
                        <VideoCamera/>
                    </el-icon>
                    <template #title>视频转4K</template>
                </el-menu-item>
                <el-menu-item index="2" @click="select('file')">
                    <el-icon>
                        <Folder/>
                    </el-icon>
                    <template #title>文件小工具</template>
                </el-menu-item>

                <el-menu-item index="3" @click="select('media')">
                    <el-icon>
                        <Film/>
                    </el-icon>
                    <template #title>音视频工具</template>
                </el-menu-item>

                <el-menu-item index="5" @click="select('img-convert')">
                    <el-icon>
                        <Switch/>
                    </el-icon>
                    <template #title>图片格式转换</template>
                </el-menu-item>

            </div>
            <div class="bottom-aligned">
                <el-menu-item index="4" @click="select('setting')">
                    <el-icon>
                        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357 357 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a352 352 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357 357 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294 294 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293 293 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294 294 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288 288 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293 293 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a288 288 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384m0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256"></path></svg>
                    </el-icon>
                    <template #title>设置</template>
                </el-menu-item>
            </div>
        </el-menu>
        <el-main style="position: relative;">

            <router-view v-slot="{ Component }">
                <KeepAlive>
                    <component :is="Component"></component>
                </KeepAlive>
            </router-view>

            <!-- 固定定位的按钮 -->
            <div class="left-bottom-icon-container"
                 style="position: absolute;bottom: 0px;left: 0px;z-index: 1000;">
                <el-button @click="changeCollapse" text size="large">
                    <el-icon>
                        <Expand v-if="isCollapse"/>
                        <Fold v-if="!isCollapse"/>
                    </el-icon>
                </el-button>
            </div>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {closeApp, minimize} from './system'
import {getCurrentWebviewWindow} from '@tauri-apps/api/webviewWindow'
import {useRouter} from 'vue-router'
import {useDark, useToggle} from '@vueuse/core'
import {getName, getVersion} from "@tauri-apps/api/app";
const appWindow = getCurrentWebviewWindow()


const isDark = useDark()
const toggleDark = useToggle(isDark)
const router = useRouter()

const appName = ref('')
const version = ref('')
const waterMark = ref('')

const currentSelected = ref('pic')
const font = reactive({
    color: 'rgba(0, 0, 0, .15)',
})
const isCollapse = ref(false);

/** 初始化时要做的事情 */
async function init() {
    useToggle(true)
    version.value = await getVersion();
    appName.value = await getName();
    waterMark.value = appName.value + ' V' + version.value
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

function changeCollapse() {
    isCollapse.value = !isCollapse.value;
}

function toggleMaximize() {
    appWindow.toggleMaximize()
    isMax.value = !isMax.value
}

function go2ImgConvert() {
    router.push({path: '/img-convert', replace: false})
}

function select(type: 'pic' | 'video' | 'file' | 'media' | 'setting' | 'img-convert') {
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
        case 'img-convert':
            go2ImgConvert();
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

.custom-vertical-menu {
    display: flex;
    flex-direction: column;
    //justify-content: space-between;
    height: 100%; /* 设置菜单的高度 */
    .top-aligned {
        margin-bottom: auto; /* 使前n项靠上 */
    }

    .bottom-aligned {
        margin-top: auto; /* 使后m项靠下 */
    }
}

.custom-vertical-menu-item {
    display: flex;
    flex-direction: row;
    justify-content: center;
    height: 100%; /* 设置菜单的高度 */
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
    height: 92vh;
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
