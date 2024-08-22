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
                    <!--                    <el-row :gutter="24">-->
                    <!--                        <el-col :span="24">-->
                    <!--                        </el-col>-->
                    <!--                        <el-col :span="24">-->
                    <!--                            <el-form-item label="OpenAI-AK">-->
                    <!--                                <el-input v-model="api_key" class="m-2" placeholder="ak"-->
                    <!--                                          size="default"-->
                    <!--                                          clearable>-->
                    <!--                                </el-input>-->
                    <!--                            </el-form-item>-->
                    <!--                        </el-col>-->
                    <!--                        <el-col :span="24">-->
                    <!--                            <el-form-item label="默认模型">-->
                    <!--                                <el-select v-model="gpt_model" class="m-2" placeholder="选择模型" size="default">-->
                    <!--                                    <el-option v-for="item in ChatModelOptions" :key="item.value" :label="item.label"-->
                    <!--                                               :value="item.value"/>-->
                    <!--                                </el-select>-->
                    <!--                            </el-form-item>-->
                    <!--                        </el-col>-->
                    <!--                        <el-col :span="18"></el-col>-->
                    <!--                        <el-col :span="6">-->
                    <!--                        </el-col>-->
                    <!--                    </el-row>-->
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


readConfig().then((conf) => {
    api_key.value = conf.gpt.ak
    gpt_model.value = conf.gpt.model
    qwen_api_key.value = conf.qwen.ak
    qwen_models.value = conf.qwen.models
    QWEN_OPTIONAL_MODELS.value = conf.qwen.optional_models
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
        }
    };
    setConfig(conf).then((conf) => {
        api_key.value = conf.gpt.ak
        gpt_model.value = conf.gpt.model
        qwen_api_key.value = conf.qwen.ak
        qwen_models.value = conf.qwen.models
        QWEN_OPTIONAL_MODELS.value = conf.qwen.optional_models
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
