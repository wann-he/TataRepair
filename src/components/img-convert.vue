<template>
    <el-scrollbar>
        <div class="img-convert-container">
            <!-- 顶部操作栏 -->
            <div class="toolbar">
                <el-button type="primary" @click="selectImages" :disabled="isConverting">
                    <el-icon><Picture /></el-icon> 选择图片
                </el-button>
                <el-button type="primary" plain @click="selectFolder" :disabled="isConverting">
                    <el-icon><Folder /></el-icon> 选择文件夹
                </el-button>
                <el-button type="danger" plain @click="clearAll" :disabled="fileList.length === 0 || isConverting">
                    <el-icon><Delete /></el-icon> 清空列表
                </el-button>
                <el-text size="small" type="info" v-if="fileList.length > 0">
                    共 {{ fileList.length }} 个文件
                </el-text>
                <el-tag :type="mode === 'magick' ? 'warning' : 'success'" effect="light" size="small" style="margin-left: auto">
                    <el-icon><Tools /></el-icon>
                    {{ mode === 'magick' ? 'ImageMagick 模式' : 'Rust 原生模式' }}
                </el-tag>
            </div>

            <!-- 拖拽上传区域 / 图片网格 -->
            <div
                ref="dropArea"
                class="drop-zone"
                :class="{ 'drag-over': isDragOver, 'has-files': fileList.length > 0 }"
                @dragover.prevent="handleDragOver"
                @dragleave="handleDragLeave"
                @drop.prevent="handleDrop"
                @click="fileList.length === 0 && selectImages()"
            >
                <template v-if="fileList.length === 0">
                    <div class="empty-state">
                        <el-icon :size="48" color="var(--el-text-color-secondary)"><UploadFilled /></el-icon>
                        <p class="empty-title">拖拽图片到此处</p>
                        <p class="empty-sub">或点击选择图片文件</p>
                        <p class="empty-hint">当前模式支持的输入格式：{{ inputFormatHint }}</p>
                    </div>
                </template>
                <template v-else>
                    <div class="image-grid">
                        <div
                            v-for="(file, index) in fileList"
                            :key="file.id"
                            class="image-card"
                            :class="{ 'converting': file.status === 'converting', 'done': file.status === 'done', 'error': file.status === 'error' }"
                        >
                            <div class="img-preview">
                                <el-image :src="file.preview" fit="cover" lazy />
                                <div class="img-overlay">
                                    <el-icon class="status-icon" v-if="file.status === 'done'"><CircleCheckFilled /></el-icon>
                                    <el-icon class="status-icon error" v-if="file.status === 'error'"><CircleCloseFilled /></el-icon>
                                </div>
                            </div>
                            <div class="img-info">
                                <el-text class="img-name" size="small" truncated>{{ file.name }}</el-text>
                                <el-text size="small" type="info">{{ formatSize(file.size) }}</el-text>
                            </div>
                            <el-progress
                                v-if="file.status === 'converting'"
                                :percentage="file.progress"
                                :stroke-width="3"
                                :show-text="false"
                                class="file-progress"
                            />
                            <el-button
                                class="remove-btn"
                                type="danger"
                                text
                                circle
                                size="small"
                                @click.stop="removeFile(index)"
                                :disabled="isConverting"
                            >
                                <el-icon><Close /></el-icon>
                            </el-button>
                        </div>
                        <div class="image-card add-more" @click="selectImages" v-if="!isConverting">
                            <el-icon :size="32"><Plus /></el-icon>
                            <span>添加</span>
                        </div>
                    </div>
                </template>
            </div>

            <!-- 设置面板 -->
            <div class="settings-panel" v-if="fileList.length > 0">
                <div class="settings-title">
                    <el-icon><Tools /></el-icon>
                    <span>转换设置</span>
                </div>
                <el-row :gutter="20">
                    <!-- 输入格式限制（仅展示当前模式可处理的文件类型） -->
                    <el-col :xs="24" :sm="12" :md="8">
                        <el-form-item label="输入格式">
                            <el-select v-model="settings.inputFormat" placeholder="不限" size="default" clearable>
                                <el-option label="不限" value="" />
                                <el-option v-for="f in inputFormatOptions" :key="f.value" :label="f.label" :value="f.value" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 输出格式 -->
                    <el-col :xs="24" :sm="12" :md="8">
                        <el-form-item label="输出格式">
                            <el-select v-model="settings.format" placeholder="选择格式" size="default">
                                <el-option-group label="常用格式">
                                    <el-option
                                        v-for="f in commonOutputFormats"
                                        :key="f.value"
                                        :label="f.label"
                                        :value="f.value"
                                        :disabled="!isFormatEnabled(f.value)"
                                    />
                                </el-option-group>
                                <el-option-group label="其他格式">
                                    <el-option
                                        v-for="f in otherOutputFormats"
                                        :key="f.value"
                                        :label="f.label"
                                        :value="f.value"
                                        :disabled="!isFormatEnabled(f.value)"
                                    />
                                </el-option-group>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 质量 -->
                    <el-col :xs="24" :sm="12" :md="8" v-if="showQuality">
                        <el-form-item label="输出质量">
                            <div class="quality-control">
                                <el-slider v-model="settings.quality" :min="1" :max="100" show-stops :marks="{1:'1',50:'50',100:'100'}" />
                                <el-input-number v-model="settings.quality" :min="1" :max="100" :controls="false" size="small" style="width: 60px" />
                            </div>
                        </el-form-item>
                    </el-col>

                    <!-- 尺寸调整模式 -->
                    <el-col :xs="24" :sm="12" :md="8">
                        <el-form-item label="尺寸调整">
                            <el-select v-model="settings.resizeMode" placeholder="不调整" size="default">
                                <el-option label="不调整" value="none" />
                                <el-option label="按宽度（保持比例）" value="width" />
                                <el-option label="按高度（保持比例）" value="height" />
                                <el-option label="按百分比" value="percent" />
                                <el-option label="固定宽高" value="fixed" />
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <!-- 尺寸数值输入 -->
                    <el-col :xs="24" :sm="12" :md="8" v-if="settings.resizeMode !== 'none'">
                        <el-form-item :label="resizeLabel">
                            <el-input-number
                                v-model="settings.resizeValue"
                                :min="1"
                                :max="settings.resizeMode === 'percent' ? 500 : 99999"
                                :controls="true"
                                size="default"
                                style="width: 140px"
                            />
                            <span class="unit-label">{{ resizeUnit }}</span>
                        </el-form-item>
                    </el-col>

                    <!-- 固定宽高时的第二输入 -->
                    <el-col :xs="24" :sm="12" :md="8" v-if="settings.resizeMode === 'fixed'">
                        <el-form-item label="高度">
                            <el-input-number v-model="settings.resizeHeight" :min="1" :max="99999" size="default" style="width: 140px" />
                            <span class="unit-label">px</span>
                        </el-form-item>
                    </el-col>

                    <!-- 保持比例 -->
                    <el-col :xs="24" :sm="12" :md="8" v-if="settings.resizeMode === 'fixed'">
                        <el-form-item label=" ">
                            <el-checkbox v-model="settings.keepAspect">保持原比例</el-checkbox>
                        </el-form-item>
                    </el-col>
                </el-row>

                <!-- 输出目录 -->
                <el-row :gutter="20" style="margin-top: 8px">
                    <el-col :span="20">
                        <el-input v-model="settings.outDir" placeholder="输出目录（默认原文件所在目录）" :disabled="true" size="default">
                            <template #prepend>
                                <el-button @click="selectOutDir" type="primary" :disabled="isConverting">选择输出目录</el-button>
                            </template>
                        </el-input>
                    </el-col>
                    <el-col :span="4">
                        <el-button @click="openOutDir" type="primary" link :disabled="!settings.outDir">打开</el-button>
                    </el-col>
                </el-row>
            </div>

            <!-- 底部进度与操作 -->
            <div class="bottom-action" v-if="fileList.length > 0">
                <div class="total-progress" v-if="isConverting">
                    <el-text>总进度: {{ doneCount }}/{{ fileList.length }}</el-text>
                    <el-progress :percentage="totalProgress" :stroke-width="8" style="width: 300px" />
                </div>
                <el-button
                    type="primary"
                    size="large"
                    color="#626aef"
                    :disabled="isConverting"
                    @click="startConvert"
                    class="convert-btn"
                >
                    <el-icon><VideoPlay /></el-icon>
                    {{ isConverting ? '转换中...' : '开始批量转换' }}
                </el-button>
            </div>
        </div>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onActivated } from 'vue'
import { open } from '@tauri-apps/plugin-dialog'
import { readFile, stat } from '@tauri-apps/plugin-fs'
import { join, basename, extname, dirname } from '@tauri-apps/api/path'
import { convertFileSrc, invoke } from '@tauri-apps/api/core'
import { ElMessage } from 'element-plus'
import {
    ALL_FORMATS,
    ConvertMode,
    findFormat,
    getInputExtensions,
    getInputFormats,
    getOutputFormats,
} from '../script/imageFormats'
import { readConfig, UserConf } from '../script/settings'

interface ConvertFile {
    id: string
    path: string
    name: string
    size: number
    preview: string
    status: 'pending' | 'converting' | 'done' | 'error'
    progress: number
    errorMsg?: string
}

const fileList = ref<ConvertFile[]>([])
const isDragOver = ref(false)
const isConverting = ref(false)
const dropArea = ref<HTMLElement | null>(null)

const mode = ref<ConvertMode>('native')
const magickPath = ref('')

const settings = reactive({
    inputFormat: '',
    format: 'png',
    quality: 92,
    resizeMode: 'none' as 'none' | 'width' | 'height' | 'percent' | 'fixed',
    resizeValue: 1920,
    resizeHeight: 1080,
    keepAspect: true,
    outDir: ''
})

async function loadConfig() {
    try {
        const conf: UserConf = await readConfig()
        mode.value = conf.img_convert?.mode || 'native'
        magickPath.value = conf.img_convert?.magick_path || ''
    } catch (e) {
        console.error('读取配置失败', e)
    }
}

onMounted(loadConfig)
onActivated(loadConfig)

// 输出格式分组（常用/其他）
const commonFormatValues = ['png', 'jpg', 'webp', 'gif']
const commonOutputFormats = computed(() =>
    ALL_FORMATS.filter(f => commonFormatValues.includes(f.value))
)
const otherOutputFormats = computed(() =>
    ALL_FORMATS.filter(f => !commonFormatValues.includes(f.value))
)

// 当前模式可用的输出格式
const availableOutputFormats = computed(() => getOutputFormats(mode.value))

function isFormatEnabled(value: string): boolean {
    if (mode.value === 'magick') return true
    const f = findFormat(value)
    return !!(f && f.nativeFormat)
}

// 当前模式可用的输入格式
const inputFormatOptions = computed(() => getInputFormats(mode.value))

const inputFormatHint = computed(() => {
    const list = inputFormatOptions.value
    const exts = new Set<string>()
    for (const f of list) {
        for (const e of f.extensions) exts.add(e)
    }
    return Array.from(exts).slice(0, 12).join(', ') + (exts.size > 12 ? ' ...' : '')
})

const showQuality = computed(() => {
    const f = findFormat(settings.format)
    return !!(f && f.hasQuality)
})

const resizeLabel = computed(() => {
    const map: Record<string, string> = {
        width: '目标宽度',
        height: '目标高度',
        percent: '缩放比例',
        fixed: '宽度',
    }
    return map[settings.resizeMode] || ''
})

const resizeUnit = computed(() => {
    return settings.resizeMode === 'percent' ? '%' : 'px'
})

const doneCount = computed(() => fileList.value.filter(f => f.status === 'done').length)
const totalProgress = computed(() => {
    if (fileList.value.length === 0) return 0
    return Math.round((doneCount.value / fileList.value.length) * 100)
})

function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 10)
}

/** 检查一个扩展名是否被当前模式支持作为输入 */
function isExtSupported(ext: string): boolean {
    const lower = ext.toLowerCase().replace(/^\./, '')
    const list = getInputFormats(mode.value)
    for (const f of list) {
        if (f.extensions.includes(lower)) return true
    }
    return false
}

async function addFiles(paths: string[]) {
    for (const p of paths) {
        let ext: string
        try {
            ext = (await extname(p)).toLowerCase()
        } catch {
            ext = '.' + (p.split('.').pop() || '').toLowerCase()
        }
        if (!isExtSupported(ext)) {
            console.warn(`跳过不支持的格式: ${p}`)
            continue
        }
        try {
            const name = await basename(p)
            const st = await stat(p)
            const preview = convertFileSrc(p)
            fileList.value.push({
                id: generateId(),
                path: p,
                name,
                size: st.size,
                preview,
                status: 'pending',
                progress: 0,
            })
        } catch (e) {
            console.error('添加文件失败:', p, e)
        }
    }
}

async function selectImages() {
    const exts = getInputExtensions(mode.value)
    const selected = await open({
        multiple: true,
        filters: [{
            name: '图片文件',
            extensions: exts
        }]
    })
    if (selected && Array.isArray(selected)) {
        await addFiles(selected)
    }
}

async function selectFolder() {
    const selected = await open({ directory: true })
    if (selected && typeof selected === 'string') {
        const { readDir } = await import('@tauri-apps/plugin-fs')
        const entries = await readDir(selected)
        const files: string[] = []
        for (const entry of entries) {
            const ext = '.' + (entry.name.split('.').pop() || '').toLowerCase()
            if (isExtSupported(ext)) {
                files.push(await join(selected, entry.name))
            }
        }
        await addFiles(files)
        ElMessage.success(`已添加 ${files.length} 个图片文件`)
    }
}

async function selectOutDir() {
    const selected = await open({ directory: true })
    if (selected && typeof selected === 'string') {
        settings.outDir = selected
    }
}

async function openOutDir() {
    const { openPath } = await import('@tauri-apps/plugin-shell')
    const path = settings.outDir || (fileList.value[0] && await dirname(fileList.value[0].path))
    if (path) await openPath(path)
}

function clearAll() {
    fileList.value = []
}

function removeFile(index: number) {
    fileList.value.splice(index, 1)
}

function handleDragOver() {
    isDragOver.value = true
}

function handleDragLeave() {
    isDragOver.value = false
}

async function handleDrop(e: DragEvent) {
    isDragOver.value = false
    const items = e.dataTransfer?.files
    if (!items) return
    const paths: string[] = []
    for (let i = 0; i < items.length; i++) {
        const f = (items[i] as any)
        if (f.path) paths.push(f.path)
    }
    await addFiles(paths)
}

/** 单文件转换：返回 Promise */
async function convertOne(file: ConvertFile, outPath: string): Promise<void> {
    if (mode.value === 'magick') {
        await invoke<string>('convert_image_magick', {
            magickPath: magickPath.value || null,
            input: file.path,
            output: outPath,
            format: settings.format,
            quality: showQuality.value ? settings.quality : null,
            resizeMode: settings.resizeMode,
            resizeValue: settings.resizeMode === 'none' ? null : settings.resizeValue,
            resizeHeight: settings.resizeMode === 'fixed' ? settings.resizeHeight : null,
            keepAspect: settings.keepAspect,
        })
    } else {
        // Rust 原生 image crate
        await invoke<string>('convert_image_native', {
            params: {
                input: file.path,
                output: outPath,
                format: settings.format,
                quality: showQuality.value ? settings.quality : undefined,
                resize_mode: settings.resizeMode,
                resize_value: settings.resizeMode === 'none' ? undefined : settings.resizeValue,
                resize_height: settings.resizeMode === 'fixed' ? settings.resizeHeight : undefined,
                keep_aspect: settings.keepAspect,
            }
        })
    }
}

async function startConvert() {
    if (fileList.value.length === 0) return

    // 检查当前输出格式是否被当前模式支持
    if (!isFormatEnabled(settings.format)) {
        ElMessage.warning(`当前模式不支持 ${settings.format}，请切换模式或选择其他格式`)
        return
    }

    isConverting.value = true

    for (const file of fileList.value) {
        if (file.status === 'done') continue
        file.status = 'converting'
        file.progress = 30
        try {
            const outDir = settings.outDir || await dirname(file.path)
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
            const outPath = await join(outDir, `${nameWithoutExt}.${settings.format}`)
            file.progress = 70
            await convertOne(file, outPath)
            file.progress = 100
            file.status = 'done'
        } catch (e: any) {
            file.status = 'error'
            file.errorMsg = String(e)
            console.error('convert error:', e)
        }
    }

    isConverting.value = false
    const success = fileList.value.filter(f => f.status === 'done').length
    const fail = fileList.value.filter(f => f.status === 'error').length
    if (fail === 0) {
        ElMessage.success(`全部 ${success} 个文件转换完成`)
    } else {
        ElMessage.warning(`完成 ${success} 个，失败 ${fail} 个`)
    }
}
</script>

<style scoped lang="scss">
.img-convert-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.drop-zone {
    border: 2px dashed var(--el-border-color);
    border-radius: 12px;
    min-height: 220px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: var(--el-fill-color-light);

    &.drag-over {
        border-color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
    }

    &.has-files {
        border-style: solid;
        border-color: var(--el-border-color);
        background: transparent;
        cursor: default;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 16px;
    }
}

.empty-state {
    text-align: center;
    color: var(--el-text-color-secondary);

    .empty-title {
        font-size: 16px;
        margin-top: 12px;
        font-weight: 500;
    }

    .empty-sub {
        font-size: 14px;
        margin-top: 4px;
    }

    .empty-hint {
        font-size: 12px;
        margin-top: 8px;
        opacity: 0.7;
    }
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    width: 100%;
}

.image-card {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: var(--el-fill-color);
    border: 1px solid var(--el-border-color-lighter);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    &.converting {
        border-color: var(--el-color-primary);
    }

    &.done {
        border-color: var(--el-color-success);
    }

    &.error {
        border-color: var(--el-color-danger);
    }

    .img-preview {
        width: 100%;
        height: 120px;
        position: relative;
        overflow: hidden;

        :deep(.el-image) {
            width: 100%;
            height: 100%;
        }

        .img-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.25);

            .status-icon {
                font-size: 32px;
                color: var(--el-color-success);

                &.error {
                    color: var(--el-color-danger);
                }
            }
        }
    }

    .img-info {
        padding: 8px;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .img-name {
            max-width: 100%;
        }
    }

    .file-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
    }

    .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
    }

    &:hover .remove-btn {
        opacity: 1;
    }
}

.add-more {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 120px;
    cursor: pointer;
    color: var(--el-text-color-secondary);
    gap: 8px;
    min-height: 168px;

    &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary);
    }
}

.settings-panel {
    background: var(--el-fill-color-light);
    border-radius: 12px;
    padding: 16px 20px;
    border: 1px solid var(--el-border-color-lighter);

    .settings-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        margin-bottom: 12px;
        font-size: 15px;
    }
}

.quality-control {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;

    .el-slider {
        flex: 1;
    }
}

.unit-label {
    margin-left: 6px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

.bottom-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0 16px;
    flex-wrap: wrap;

    .total-progress {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .convert-btn {
        min-width: 180px;
    }
}
</style>
