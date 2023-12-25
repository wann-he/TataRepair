<template>
    <el-scrollbar>
        <span>
            <el-button @click="saveSetting" type="primary" link style="float: right;">保存
        </el-button>
        </span>
        <div class="content-box path-box">
            <el-space :size="'default'" spacer="" style="margin-top: 10px" direction="vertical" alignment="flex-start">
                <el-form label-width="auto" style="max-width: 600px">
                    <el-row :gutter="24" style="margin-top: 50px">
                        <el-col :span="24">
                            <el-form-item label="通义千问-AK">
                                <el-input v-model="qwen_api_key" class="m-2" placeholder="通义千问-AK"
                                          size="default"
                                          clearable>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="可选模型">
                                <el-select v-model="qwen_models"
                                           multiple
                                           filterable
                                           allow-create
                                           class="m-2" placeholder="可选模型" size="default">
                                    <el-option v-for="item in QWEN_OPTIONAL_MODELS" :key="item" :label="item"
                                               :value="item"/>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-divider></el-divider>

                    <!-- 图片格式转换设置 -->
                    <div class="section-title">
                        <el-icon><Picture /></el-icon>
                        <span>图片格式转换</span>
                    </div>
                    <el-row :gutter="24">
                        <el-col :span="24">
                            <el-form-item label="转换模式">
                                <el-radio-group v-model="img_convert_mode">
                                    <el-radio-button value="native">Rust 原生库</el-radio-button>
                                    <el-radio-button value="magick">ImageMagick</el-radio-button>
                                </el-radio-group>
                                <el-text size="small" type="info" style="margin-left: 12px">
                                    原生模式打包体积小，格式支持有限；magick 模式需用户自行安装 ImageMagick
                                </el-text>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="24" v-if="img_convert_mode === 'magick'">
                        <el-col :span="24">
                            <el-form-item label="magick 路径">
                                <el-input v-model="magick_path" placeholder="留空则从系统 PATH 中查找 magick"
                                          size="default" clearable>
                                    <template #append>
                                        <el-button @click="selectMagickPath">选择</el-button>
                                    </template>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label=" ">
                                <el-button type="primary" @click="testMagick" :loading="testing">
                                    <el-icon><CircleCheck /></el-icon> 测试是否可用
                                </el-button>
                                <el-tag v-if="testResult === 'ok'" type="success" style="margin-left: 12px">
                                    <el-icon><CircleCheckFilled /></el-icon> 检测通过：{{ magickVersion }}
                                </el-tag>
                                <el-tag v-else-if="testResult === 'fail'" type="danger" style="margin-left: 12px">
                                    <el-icon><CircleCloseFilled /></el-icon> 未检测到 magick
                                </el-tag>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24" v-if="testResult === 'fail'">
                            <el-alert type="warning" :closable="false" show-icon>
                                <template #title>未在系统中找到 ImageMagick</template>
                                <div style="margin-top: 4px">
                                    请前往
                                    <el-link type="primary" href="https://imagemagick.org/download/#gsc.tab=0" target="_blank">
                                        ImageMagick 官方下载页
                                    </el-link>
                                    下载并安装 Windows 版本，安装时请勾选「Add application directory to your system path」或在上方手动指定 magick.exe 路径。
                                </div>
                            </el-alert>
                        </el-col>
                    </el-row>
                </el-form>

            </el-space>
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {ChatModelVal, MultipleVal, QwenModelOptions, QwenModelVal} from "../script/constants";
import {readConfig, setConfig, UserConf} from "../script/settings";
import {invoke} from '@tauri-apps/api/core'
import {open} from '@tauri-apps/plugin-dialog'
import type {ConvertMode} from '../script/imageFormats'


const checked1 = ref(false)


const onChange1 = (status: boolean) => {
    checked1.value = status
}

const gpt_model = ChatModelVal
const qwen_model = QwenModelVal
const multiple = MultipleVal

const labelPosition = ref('right')
const thread = ref(1);


/**
 * 切换面板
 * @param tab
 * @param event
 */
const handleClick = (tab: TabsPaneContext, event: Event) => {
}

/** 选择的目录路径 */
const path = ref('')
const api_key = ref('')
const qwen_api_key = ref('')
const num = ref(1)
const models = ref([''])
const QWEN_OPTIONAL_MODELS = ref([''])
const qwen_models = ref([''])

// 图片转换相关
const img_convert_mode = ref<ConvertMode>('native')
const magick_path = ref('')
const testing = ref(false)
const testResult = ref<'ok' | 'fail' | null>(null)
const magickVersion = ref('')


readConfig().then((conf) => {
    api_key.value = conf.gpt.ak
    gpt_model.value = conf.gpt.model
    qwen_api_key.value = conf.qwen.ak
    qwen_models.value = conf.qwen.models
    QWEN_OPTIONAL_MODELS.value = conf.qwen.optional_models
    img_convert_mode.value = conf.img_convert?.mode || 'native'
    magick_path.value = conf.img_convert?.magick_path || ''
})

const saveSetting = () => {
    console.log("saveSetting.")
    // 去重 qwen_models.value
    const uniqueQwenModels = [...new Set(qwen_models.value)];

    // 去重 QWEN_OPTIONAL_MODELS.value
    const uniqueOptionalModels = [...new Set(QWEN_OPTIONAL_MODELS.value)];

    // 遍历 uniqueQwenModels 并添加未存在的模型到 uniqueOptionalModels
    uniqueQwenModels.forEach(model => {
        if (!uniqueOptionalModels.includes(model)) {
            uniqueOptionalModels.push(model);
        }
    });

    const conf: UserConf = {
        gpt: {ak: api_key.value, model: gpt_model.value},
        qwen: {
            ak: qwen_api_key.value,
            models: uniqueQwenModels,
            optional_models: uniqueOptionalModels
        },
        img_convert: {
            mode: img_convert_mode.value,
            magick_path: magick_path.value
        }
    };
    setConfig(conf).then((conf) => {
        api_key.value = conf.gpt.ak
        gpt_model.value = conf.gpt.model
        qwen_api_key.value = conf.qwen.ak
        qwen_models.value = conf.qwen.models
        QWEN_OPTIONAL_MODELS.value = conf.qwen.optional_models
        img_convert_mode.value = conf.img_convert.mode
        magick_path.value = conf.img_convert.magick_path
        ElMessage({
            message: '保存成功',
            type: 'success'
        })
    });
}

async function selectMagickPath() {
    const selected = await open({
        multiple: false,
        filters: [{name: 'ImageMagick', extensions: ['exe']}]
    })
    if (typeof selected === 'string') {
        magick_path.value = selected
    }
}

async function testMagick() {
    testing.value = true
    testResult.value = null
    try {
        const result = await invoke<{ available: boolean; version: string; path: string }>('check_magick_available', {
            magickPath: magick_path.value || null
        })
        if (result.available) {
            testResult.value = 'ok'
            magickVersion.value = result.version
            ElMessage.success('ImageMagick 可用')
        } else {
            testResult.value = 'fail'
            ElMessage.warning('检测失败：' + result.version)
        }
    } catch (e: any) {
        testResult.value = 'fail'
        console.error(e)
        ElMessage.warning('检测失败：' + (e?.message || e))
    } finally {
        testing.value = false
    }
}


// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    // return false
    return false
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

.section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 8px;
    color: var(--el-text-color-primary);
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
