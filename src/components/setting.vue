<template>
    <el-scrollbar>
        <h3>设置</h3>
        <span>
            <el-button @click="saveSetting" type="primary" link style="float: right;">保存
        </el-button>
        </span>
        <div class="box path-box">
            <el-space :size="'default'" spacer="" style="margin-top: 10px" direction="vertical" alignment="flex-start">
                <el-form label-width="auto" style="max-width: 600px">

                    <el-row :gutter="24">
                        <el-col :span="24">

                        </el-col>

                        <el-col :span="24">
                            <el-form-item label="模型">
                                <el-select v-model="model" class="m-2" placeholder="选择模型" size="default">
                                    <el-option v-for="item in ChatModelOptions" :key="item.value" :label="item.label"
                                               :value="item.value"/>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="AK">
                                <el-input v-model="api_key" class="m-2" placeholder="ak"
                                          size="default"
                                          clearable>
                                </el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="18"></el-col>
                        <el-col :span="6">

                        </el-col>

                    </el-row>
                    <el-row :gutter="24">

                    </el-row>
                </el-form>
            </el-space>
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {open} from '@tauri-apps/api/dialog'
import {appDir} from '@tauri-apps/api/path'
import type {TabsPaneContext} from 'element-plus'
import {ElMessage} from 'element-plus'
import {ChatModelOptions, ChatModelVal, MultipleVal} from "../script/constants";
import {readConfig, setConfig, UserConf} from "../script/settings";


const checked1 = ref(false)


const onChange1 = (status: boolean) => {
    checked1.value = status
}

const model =  ChatModelVal
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
const out_path = ref('')
const api_key = ref('')
const num = ref(1)

readConfig().then((conf) => {
    api_key.value = conf.gpt.ak
    model.value = conf.gpt.model
})
/** 选择目录 */


let basePath = ref('')

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

const saveSetting = () => {
    console.log("saveSetting.")
    const conf: UserConf = {gpt: {ak: api_key.value, model: model.value}}
    setConfig(conf).then((conf) => {
        ElMessage({
            message: conf,
            type: 'success'
        })
    });
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
    margin: 50px 10px;
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

</style>
