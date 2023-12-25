import {ref} from "vue";

export const ModelVal = ref<'realesrgan-x4plus' | 'reaesrnet-x4plus' | 'realesrgan-x4plus-anime' | 'realesr-animevideov3'>('realesrgan-x4plus')
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


export const  CodingModeOptions = [
    {
        value: 'hevc_nvenc',
        label: '硬件加速',
    },
    {
        value: 'libx264',
        label: 'CPU编码',
    },
]