<template xmlns="http://www.w3.org/1999/html">
    <el-scrollbar>
        <el-space :size="'default'" spacer="" style="margin-top: 10px">
            <el-tooltip content="将文件夹下所有子目录中的文件提取至当前目录" placement="bottom-end" :auto-close="5000">
                <el-check-tag :checked="checked1" type="primary" @change="onChange1">
                    文件提级
                </el-check-tag>
            </el-tooltip>
            <el-tooltip content="多种规则重命名文件夹下的文件" placement="bottom" :auto-close="5000">
                <el-check-tag :checked="checked2" type="warning" @change="onChange2">
                    批量重命名
                </el-check-tag>
            </el-tooltip>
            <el-tooltip content="将文件夹下的所有文件名提取至txt" placement="bottom" :auto-close="5000">
                <el-check-tag :checked="checked3" type="success" @change="onChange3">
                    文件名提取
                </el-check-tag>
            </el-tooltip>
            <el-tooltip content="将压缩包合并隐藏至图片内，结果文件显示为图片" placement="bottom" :auto-close="5000">
                <el-check-tag :checked="checked4" type="danger" @change="onChange4">
                    合并隐藏
                </el-check-tag>
            </el-tooltip>
        </el-space>


        <div class="content-box path-box">
            <div class="right-top-icon-container" style="margin-top: 35px">
                <el-button @click="showUndoDialog" type="primary" text :disabled="!hasHistory">操作回退
                </el-button>
                <el-button @click="resetAll" type="primary" text>重置
                </el-button>
                <el-button type="primary" color="#626aef" plain @click="startJob(1)" :disabled="!out_path"
                    v-show="checked1">
                    <el-icon>
                        <VideoPlay />
                    </el-icon>&nbsp;开&nbsp;始
                </el-button>
                <el-button type="primary" color="#626aef" plain @click="startJob(3)" :disabled="!out_path"
                    v-show="checked3">
                    <el-icon>
                        <VideoPlay />
                    </el-icon>&nbsp;开&nbsp;始
                </el-button>
                <el-button type="primary" color="#626aef" plain @click="startJob(4)" :disabled="!out_path"
                    v-show="checked4">
                    <el-icon>
                        <VideoPlay />
                    </el-icon>&nbsp;开&nbsp;始
                </el-button>
            </div>
            <el-space :size="'default'" spacer="" style="margin-top: 30px" direction="vertical" alignment="flex-start">
                <el-row :gutter="24">
                    <el-col :span="24">
                        <el-form-item label="文件路径">
                            <el-col :span="22">
                                <el-input v-model="out_path" :placeholder="checked4 ? '输出路径,默认图片所在文件夹' : '文件夹路径'"
                                    :disabled="true" @click="selectOutDir" size="default" clearable>
                                    <template #append>
                                        <el-button @click="selectOutDir" type="default" style="width: 115px">点击此处选择
                                        </el-button>
                                    </template>
                                </el-input>
                            </el-col>
                            <el-col :span="2">
                                <el-button @click="openOutDir" type="primary" link :disabled="!out_path">打开
                                </el-button>
                            </el-col>
                        </el-form-item>
                    </el-col>
                    <el-col :span="6">

                    </el-col>
                </el-row>
                <!--      文件提级          -->
                <el-row :gutter="24">
                    <el-col :span="12" v-show="checked1">
                        <el-form-item label="递归">
                            <el-switch v-model="recursively" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12" v-show="checked1">
                        <el-form-item label="完成后删除子文件夹">
                            <el-switch v-model="delSubAfter" />
                        </el-form-item>
                    </el-col>
                    <!--       提取文件名         -->
                    <el-col :span="12" v-show="checked3">
                        <el-form-item label="包含后缀名">
                            <el-switch v-model="containsSuffix" />
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-space>
            <div class="row-center">
                <div style="width: 40%">
                    <el-card style="margin-top: 10px" v-show="checked4">
                        <template #header>
                            <div class="card-header">
                                <el-text size="large">图&nbsp;片
                                    <el-tooltip content="文件名路径不能有空格/特殊字符" placement="top">
                                        <el-icon>
                                            <Warning />
                                        </el-icon>
                                    </el-tooltip>
                                </el-text>
                                <el-button class="right-button" size="small" type="primary" text
                                    @click="select2Merge('pic')">
                                    <el-icon>
                                        <Picture />
                                    </el-icon>&nbsp;选择图片
                                </el-button>
                            </div>
                        </template>
                        <div class="column-center" style="height: 140px">
                            <el-image style="width: 100px; height: 100px" :src="merged_img_url" :fit="'scale-down'">
                                <template #error>
                                    <div class="image-slot">
                                        <el-icon>
                                            <Picture />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-image>
                            <div style="height: 25px">
                                <el-tag v-show="merged_img_name" closable size="large" effect="light" type="info"
                                    :disable-transitions="false" @close="handleTagClose(1)">
                                    {{ merged_img_name }}
                                </el-tag>
                            </div>
                        </div>
                    </el-card>
                </div>
                <el-text size="large" v-show="checked4">+</el-text>
                <div style="width: 40%">
                    <el-card style="margin-top: 10px" v-show="checked4">
                        <template #header>
                            <div class="card-header">
                                <el-text size="large">压缩包
                                    <el-tooltip content="文件名路径不能有空格/特殊字符 | 如何还原：修改结果图片的后缀为原始压缩包的后缀、解压" placement="top">
                                        <el-icon>
                                            <Warning />
                                        </el-icon>
                                    </el-tooltip>
                                </el-text>
                                <el-button class="right-button" size="small" type="primary" text
                                    @click="select2Merge('zip')">
                                    <el-icon>
                                        <DocumentAdd />
                                    </el-icon>
                                    &nbsp;选择zip
                                </el-button>
                            </div>
                        </template>
                        <div class="column-center">
                            <el-image style="width: 100px; height: 100px" :fit="'scale-down'">
                                <template #error>
                                    <div class="image-slot">
                                        <el-icon v-if="!merged_zip">
                                            <FolderDelete />
                                        </el-icon>
                                        <el-icon v-else>
                                            <FolderChecked />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-image>
                            <div style="height: 25px">
                                <el-tag v-show="merged_zip_name" closable size="large" effect="light" type="info"
                                    :disable-transitions="false" @close="handleTagClose(2)">
                                    {{ merged_zip_name }}
                                </el-tag>
                            </div>
                        </div>
                    </el-card>
                </div>
            </div>
            <div style="width: 90%;padding: auto;">
                <!--       批量重命名         -->
                <el-card v-show="checked2" style="margin-top: 10px">
                    <template #header>
                        <div class="card-header">
                            <el-text size="large">批量重命名 - 文本替换</el-text>
                            <el-button class="right-button" @click="startJob(2)" type="primary" link
                                :disabled="!out_path" v-show="checked2">替换
                            </el-button>
                        </div>
                    </template>
                    <el-form-item label="查找文本">
                        <!-- <el-input v-show="!replaceInputDisabled" v-model="tobe_replaced"  size="default" clearable style="flex: 1;" /> -->
                        <el-input v-model="tobe_replaced" :placeholder="replaceInputPlaceholder" :disabled="replaceInputDisabled" size="default" clearable>
                            <template #append>
                                <el-select v-model="replaceType" placeholder="替换模式" @change="replaceTypeChange"
                                    style="width: 150px">
                                    <el-option v-for="item in ReplaceTypeOptions" :key="item.value" :label="item.label"
                                        :value="item.value" />
                                </el-select>
                            </template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="字符索引" v-show="numShow || numRangeShow">
                        <el-input-number size="small" v-model="num" :min="1" :max="40" v-show="numShow"
                            controls-position="right" />
                        <el-input-number size="small" v-model="numStart" :min="1" :max="40" controls-position="right"
                            v-show="numRangeShow" style="max-width: 90px" />
                        <el-text v-show="numRangeShow">~</el-text>
                        <el-input-number size="small" v-model="numEnd" :min="1" :max="40" controls-position="right"
                            v-show="numRangeShow" style="max-width: 90px" />
                    </el-form-item>
                    <el-form-item label="替换文本">
                        <el-input v-model="replaced_with" placeholder="替换为" size="default" clearable>
                        </el-input>
                    </el-form-item>
                </el-card>
                <el-card v-show="checked2" style="margin-top: 10px">
                    <template #header>
                        <div class="card-header">
                            <el-text size="large">批量重命名 - 编号
                                <el-tooltip content="子文件夹也会被重命名" placement="top">
                                    <el-icon>
                                        <Warning />
                                    </el-icon>
                                </el-tooltip>
                            </el-text>
                            <el-button class="right-button" @click="startJob(201)" type="primary" link
                                :disabled="!out_path" v-show="checked2">开始编号重命名
                            </el-button>
                        </div>
                    </template>
                         <div class="inline-form">
                            <el-text>将后缀名(忽略大小写)为</el-text>
                            <el-input v-model="suffix_match" placeholder="不填默认所有。例：.png" size="small"
                                clearable></el-input>
                            <el-text>的所有文件，从</el-text>
                            <el-input v-model="start_num" type="number" size="small"></el-input>
                            <el-text>开始编号</el-text>
                        </div>
                        <div class="inline-form">
                            <el-text>添加前缀</el-text>
                            <el-input v-model="prefix_add" placeholder="例：prefix_" size="small" clearable></el-input>
                            <el-text>，添加后缀</el-text>
                            <el-input v-model="suffix_add" placeholder="例：_suffix" size="small" clearable></el-input>
                        </div>
                        <div class="inline-form">
                            <el-text>源文件名</el-text>
                            <el-radio-group v-model="keep_original_name" size="small">
                                <el-radio-button value="true" label="保留"></el-radio-button>
                                <el-radio-button value="false" label="不保留"></el-radio-button>
                            </el-radio-group>
                        </div>
                 </el-card>
            </div>
        </div>

        <el-dialog v-model="undoDialogVisible" title="操作回退确认" width="700px" :close-on-click-modal="false">
            <el-scrollbar max-height="450px">
                <el-table :data="latestOperation?.operations || []" border style="width: 100%">
                    <el-table-column prop="oldPath" label="原始路径" min-width="45%" show-overflow-tooltip />
                    <el-table-column prop="newPath" label="当前路径" min-width="45%" show-overflow-tooltip />
                    <el-table-column prop="operationType" label="操作类型" width="100">
                        <template #default="scope">
                            <el-tag v-if="scope.row.operationType === 'move'" type="primary">移动</el-tag>
                            <el-tag v-else-if="scope.row.operationType === 'rename'" type="success">重命名</el-tag>
                            <el-tag v-else-if="scope.row.operationType === 'delete'" type="danger">删除</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </el-scrollbar>
            <template #footer>
                <div class="dialog-footer">
                    <el-text style="margin-right: 20px">确认回退此操作？此操作将恢复所有文件到操作前的状态。</el-text>
                    <el-button @click="undoDialogVisible = false">取消</el-button>
                    <el-button type="danger" @click="confirmUndo">确认回退</el-button>
                </div>
            </template>
        </el-dialog>

    </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { desktopDir } from '@tauri-apps/api/path'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    collectFilename,
    FConfig,
    FConfig201,
    numSortFilename,
    replaceFilename,
    Result,
    upgradeFile2Curr,
    merge2Pic
} from '../script/filetools'
import { open as shellopen } from "@tauri-apps/plugin-shell";
import { ReplaceTypeOptions } from "../script/constants";
import { Image } from "../script/mp4ToImg";
import { convertFileSrc } from "@tauri-apps/api/core";
import {
    addOperation,
    getLatestOperation,
    removeLatestOperation,
    OperationHistory
} from '../script/operation-history'
import { undoOperation } from '../script/undo-operation'


const checked1 = ref(true)
const checked2 = ref(false)
const checked3 = ref(false)
const checked4 = ref(false)
const checked5 = ref(false)

const recursively = ref(true)
const delSubAfter = ref(false)
const containsSuffix = ref(true)
const replaceType = ref(1)

const replaceInputDisabled = computed(() => {
    return [3, 4, 5, 6, 7,8,9].includes(replaceType.value)
})

const replaceInputPlaceholder = computed(() => {
    const placeholders: Record<number, string> = {
        1: '替换字符串',
        2: '正则表达式',
        3: '无需输入',
        4: '无需输入',
        5: '无需输入',
        6: '无需输入',
        7: '无需输入',
        8: '无需输入',
        9: '无需输入'
    }
    return placeholders[replaceType.value] || '替换字符串'
})

const merged_img = ref<Image>()
const merged_img_full_path = ref()
const merged_img_name = ref()
const merged_img_url = ref('')
const merged_zip = ref()
const merged_zip_name = ref()

const dynamicTags = ref<string[]>([merged_img.value?.name, merged_zip.value])

/** 选择的目录路径 */
const out_path = ref('')
const tobe_replaced = ref('')
const replaced_with = ref('')
const suffix_match = ref('')
const prefix_add = ref('')
const suffix_add = ref('')
const start_num = ref(1)
const keep_original_name = ref("false")

const hasHistory = ref(false)
const latestOperation = ref<OperationHistory | null>(null)
const undoDialogVisible = ref(false)


const num = ref(1)
const numShow = ref(false)

const numStart = ref(1)
const numEnd = ref(1)
const numRangeShow = ref(false)


const resetAll = () => {
    out_path.value = ''

    recursively.value = true
    delSubAfter.value = false
    containsSuffix.value = true

    tobe_replaced.value = ''
    replaced_with.value = ''
    suffix_match.value = ''
    prefix_add.value = ''
    suffix_add.value = ''
    start_num.value = 1
    keep_original_name.value = "false"

    merged_img.value = undefined
    merged_img_url.value = ''
    merged_img_full_path.value = undefined
    merged_img_name.value = undefined
    merged_zip.value = undefined
    merged_zip_name.value = undefined

}

const onChange1 = (status: boolean) => {
    checked1.value = status
    if (status) {
        checked2.value = false
        checked3.value = false
        checked4.value = false
        checked5.value = false
    }
    resetAll()
}

const onChange2 = (status: boolean) => {
    checked2.value = status
    if (status) {
        checked1.value = false
        checked3.value = false
        checked4.value = false
        checked5.value = false
    }
    resetAll()
}

const onChange3 = (status: boolean) => {
    checked3.value = status
    if (status) {
        checked1.value = false
        checked2.value = false
        checked4.value = false
        checked5.value = false
    }
    resetAll()
}
const onChange4 = (status: boolean) => {
    checked4.value = status
    if (status) {
        checked1.value = false
        checked2.value = false
        checked3.value = false
        checked5.value = false
    }
    resetAll()
}

const handleTagClose = (tag: number) => {
    if (tag == 1) {
        merged_img.value = undefined
        merged_img_full_path.value = undefined
        merged_img_name.value = undefined
        merged_img_url.value = ''
    }
    if (tag == 2) {
        merged_zip.value = undefined
        merged_zip_name.value = undefined
    }
}


async function selectOutDir() {
    const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: await desktopDir(),
    })
    if (selected) {
        out_path.value = selected.toString()
        console.log('out_path:' + out_path.value)
        // 当选择时才修改path的值
        console.log(selected)
    }
}

// pic zip
async function select2Merge(type: string) {
    const extensions = type == 'pic' ? ['png', 'jpg', 'jpeg', 'heic', 'gif', 'tiff'] : ['zip', 'rar', '7z', 'tar.gz'];
    const selected = await open({
        directory: false,
        multiple: false,
        defaultPath: await desktopDir(),
        filters: [
            {
                name: "Chose File",
                extensions: extensions
            }
        ],
    })
    if (selected && type == 'pic') {
        let currPath = selected.split('\\').slice(0, -1).join('\\')
        let filename = selected.split('\\').slice(-1)[0];
        if (!out_path.value) {
            out_path.value = currPath
        }
        console.log('out_path:' + out_path.value)
        // 当选择时才修改path的值
        console.log(selected)

        merged_img_full_path.value = selected;
        merged_img_name.value = filename

        merged_img_url.value = convertFileSrc(selected)

        merged_img.value = { url: convertFileSrc(selected), percentage: 0, name: filename };

        console.log('merged_img', merged_img.value)
        dynamicTags.value.push(selected)
    }
    if (selected && type == 'zip') {
        console.log(selected)
        merged_zip.value = selected;
        merged_zip_name.value = selected.split('\\').slice(-1)[0]

        console.log('merged_zip', merged_zip.value)
        dynamicTags.value.push(selected)
    }
}

const openOutDir = () => {
    console.log("openOutDir.")
    shellopen(out_path.value);
}

const res: Result = { failedNum: 0, rcode: -1 };

const startJob = (type: number) => {
    console.log("startJob." + type)
    if (type == 1) {
        upgradeFile2Curr(out_path.value, recursively.value, delSubAfter.value).then(res => {
            if (res.rcode == 0) {
                ElMessage({
                    message: '文件提级成功',
                    type: 'success'
                })
                if (res.operations && res.operations.length > 0) {
                    addOperation('upgrade', res.operations).then(() => {
                        updateHistoryStatus()
                    })
                }
            }
            return
        }).finally();
    }
    if (type == 2) {
        const fconfig: FConfig = {
            tobe_replaced: tobe_replaced.value,
            replaced_with: replaced_with.value,
            type: replaceType.value,
            num: num.value,
            numStart: numStart.value,
            numEnd: numEnd.value
        }
        replaceFilename(out_path.value, fconfig)
            .then(res => {
                if (res.rcode == 0) {
                    ElMessage({
                        message: res.failedNum && res.failedNum > 0 ? '批量重命名完成,' + res.failedNum + '个失败' : '文件批量重命名成功',
                        type: 'success'
                    })
                    if (res.operations && res.operations.length > 0) {
                        addOperation('rename', res.operations).then(() => {
                            updateHistoryStatus()
                        })
                    }
                }
                return
            })
            .finally();
    }
    if (type == 201) {
        const fConfig201: FConfig201 = {
            suffix_match: suffix_match.value,
            prefix_add: prefix_add.value,
            suffix_add: suffix_add.value,
            start_num: start_num.value,
            keep_original_name: keep_original_name.value == "true"
        }
        numSortFilename(out_path.value, fConfig201)
            .then(res => {
                if (res.rcode == 0) {
                    ElMessage({
                        message: res.failedNum && res.failedNum > 0 ? '批量重命名完成,' + res.failedNum + '个失败' : '文件批量重命名成功',
                        type: 'success'
                    })
                    if (res.operations && res.operations.length > 0) {
                        addOperation('rename', res.operations).then(() => {
                            updateHistoryStatus()
                        })
                    }
                }
                return
            })
            .catch((reason) => {
                ElMessage({
                    message: '执行失败:' + reason,
                    type: 'error'
                })
            })
            .finally();
    }
    if (type == 3) {
        collectFilename(out_path.value, false, containsSuffix.value)
            .then(res => {
                if (res.rcode == 0) {
                    ElMessage({
                        message: res.failedNum && res.failedNum > 0 ? '提取文件名完成,' + res.failedNum + '个失败' : '提取文件名成功，请打开源文件夹查看',
                        type: 'success',
                        duration: 3000,
                        onClose: () => {
                        }
                    })
                    shellopen(res.data);
                }
                return
            })
            .finally();
    }
    if (type == 4) {
        if (!merged_img.value || !merged_zip.value) {
            ElMessage({
                message: '请选择文件',
                type: 'error'
            })
            return
        }
        if (merged_img_full_path.value.indexOf(' ') > -1 || merged_zip.value.indexOf(' ') > -1) {
            ElMessage({
                message: '文件路径中不能有空格',
                type: 'error'
            })
            return
        }
        merge2Pic(merged_img_full_path.value, merged_zip.value, out_path.value)
            .then(res => {
                if (res.rcode == 0) {
                    ElMessage({
                        message: '操作成功，请打开源文件夹查看',
                        type: 'success',
                        duration: 3000,
                        onClose: () => {
                        }
                    })
                    openOutDir();
                }
                return
            })
            .finally();
    }
}

const updateHistoryStatus = async () => {
    const latest = await getLatestOperation()
    hasHistory.value = latest !== null
    latestOperation.value = latest
}

const showUndoDialog = async () => {
    const latest = await getLatestOperation()
    if (latest) {
        latestOperation.value = latest
        undoDialogVisible.value = true
    }
}

const confirmUndo = async () => {
    if (!latestOperation.value) return

    try {
        const result = await undoOperation(latestOperation.value)

        if (result.success) {
            ElMessage({
                message: '操作回退成功',
                type: 'success'
            })

            await removeLatestOperation()
            undoDialogVisible.value = false
            await updateHistoryStatus()
        } else {
            ElMessage({
                message: `操作回退完成，但有 ${result.failedNum} 个文件回退失败`,
                type: 'warning'
            })

            await removeLatestOperation()
            undoDialogVisible.value = false
            await updateHistoryStatus()
        }
    } catch (error) {
        ElMessage({
            message: '操作回退失败: ' + error,
            type: 'error'
        })
    }
}

onMounted(() => {
    updateHistoryStatus()
})

const replaceTypeChange = (value: number) => {
    replaceType.value = value;
    tobe_replaced.value = ''
    if (value == 8) {
        numRangeShow.value = true
    } else {
        numRangeShow.value = false
        numStart.value = 1
        numEnd.value = 1
    }
    if (value == 3 || value == 4 || value == 5 || value == 9) {
        numShow.value = true
    } else {
        num.value = 1
        numShow.value = false
    }
}

// 禁止右键
document.oncontextmenu = function () {
    // false为禁止
    return false
    // return true
}
</script>

<style scoped lang="scss">
.el-col {
    padding: 0;
}

.tip {
    color: red;
    margin: 3px auto;
    text-align: right;
}

.title {
    width: 170px;
    height: 50px;
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

.disable-button {
    cursor: not-allowed;
    pointer-events: none;
}

.right-button {
    float: right;
}

.row-center {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 10px;
}

.column-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
}

.inline-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 15px;
    gap: 5px;

    >* {
        flex-shrink: 0;
    }

    .el-input {
        width: auto;
        max-width: 200px;
    }

    .el-input[type="number"] {
        max-width: 100px;
    }
}

.demonstration {
    display: block;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-bottom: 20px;
}

.image-slot {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
    font-size: 30px;
}

.image-slot .el-icon {
    font-size: 30px;
}
</style>
