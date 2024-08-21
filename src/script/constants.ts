import {ref} from "vue";

export const ModelVal = ref<'realesrgan-x4plus' | 'reaesrnet-x4plus' | 'realesrgan-x4plus-anime' | 'realesr-animevideov3'>('realesrgan-x4plus')
export const ChatModelVal = ref<'gpt-3.5-turbo-1106' | 'gpt-4o-mini'>('gpt-3.5-turbo-1106')
export const QwenModelVal = ref<'qwen-max' | 'qwen-plus' | 'qwen-turbo'>('qwen-turbo')
export const ReplaceTypeVal = ref<1 | 2 | 3 | 4>()
export const MultipleVal = ref<2 | 3 | 4>(4)
export const MultipleOptions = [
    {
        value: 4,
        label: '4倍(推荐)',
    },
    {
        value: 3,
        label: '3倍',
    },
    {
        value: 2,
        label: '2倍',
    },
]
export const ModelOptions = [
    {
        value: 'realesrgan-x4plus',
        label: 'realesrgan-x4plus(默认)',
    },
    {
        value: 'reaesrnet-x4plus',
        label: 'reaesrnet-x4plus',
    },
    {
        value: 'realesrgan-x4plus-anime',
        label: 'realesrgan-x4plus-anime(动漫图像)',
    },
    {
        value: 'realesr-animevideov3',
        label: 'realesr-animevideov3(动漫视频)',
    },
]

export const ChatModelOptions = [
    {
        value: 'gpt-3.5-turbo-1106',
        label: 'gpt-3.5-turbo-1106',
    },
    {
        value: 'gpt-4o-mini',
        label: 'gpt-4o-mini',
    },
]

export const QwenModelOptions = [
    {
        value: 'qwen-turbo',
        label: 'qwen-turbo',
    },
    {
        value: 'qwen-plus',
        label: 'qwen-plus',
    },
    {
        value: 'qwen-max',
        label: 'qwen-max',
    }
]
export const ReplaceTypeOptions = [
    {
        value: 1,
        label: '精准匹配替换',
    }
    , {
        value: 2,
        label: '正则替换',
    }
    , {
        value: 3,
        label: '替换前x个字符',
    }
    , {
        value: 4,
        label: '替换后x个字符',
    }
    , {
        value: 5,
        label: '替换后x个字符(不改变文件后缀名)',
    }
    , {
        value: 6,
        label: '添加前缀',
    }
    , {
        value: 7,
        label: '添加后缀',
    }
]

export const CodingModeOptions = [
    {
        value: 'hevc_nvenc',
        label: '硬件加速',
    },
    {
        value: 'libx264',
        label: 'CPU编码',
    },
]