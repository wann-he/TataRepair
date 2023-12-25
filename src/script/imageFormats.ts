// 图片格式定义与各模式支持的格式列表
// magick 模式以 ImageMagick 支持的格式为准（覆盖最广）
// native 模式以 Rust `image` crate 默认支持为准

export type ConvertMode = 'native' | 'magick'

export interface FormatInfo {
    value: string
    label: string
    /** 文件扩展名（用于过滤输入文件），小写，不含点 */
    extensions: string[]
    /** magick 命令使用的格式名（与 image crate 的 format 枚举一致） */
    magickFormat: string
    /** image crate 格式枚举名（用于 Rust 侧），不原生支持则为 undefined */
    nativeFormat?: string
    /** 是否需要展示质量滑块 */
    hasQuality: boolean
    description?: string
}

// 参考 Rust image crate 默认 features 支持的格式（0.25+）：
//   BMP, DDS, EXR, FF, GIF, HDR, ICO, JPEG, PNG, PNM, QOI, TGA, TIFF, WEBP
//
// magick 支持但原生不支持的：HEIC, AVIF, SVG, RAW(CR2/NEF/ARW/DNG...), SGI, XBM, XPM, JXL...
// 原生支持但 magick 也支持：BMP, GIF, ICO, JPEG, PNG, PNM, TGA, TIFF, WEBP
// 特殊情况：QOI/HDR/DDS/EXR/FF 原生支持，magick 通过 -size 也支持一些

export const ALL_FORMATS: FormatInfo[] = [
    // 常用格式
    { value: 'png', label: 'PNG（无损，推荐）', extensions: ['png'], magickFormat: 'png', nativeFormat: 'Png', hasQuality: false },
    { value: 'jpg', label: 'JPG / JPEG', extensions: ['jpg', 'jpeg'], magickFormat: 'jpg', nativeFormat: 'Jpeg', hasQuality: true, description: '有损压缩，体积小' },
    { value: 'webp', label: 'WebP（现代格式）', extensions: ['webp'], magickFormat: 'webp', nativeFormat: 'WebP', hasQuality: true },
    { value: 'gif', label: 'GIF（动图/256色）', extensions: ['gif'], magickFormat: 'gif', nativeFormat: 'Gif', hasQuality: false, description: 'magick 支持动画，native 仅首帧' },
    // 通用位图
    { value: 'bmp', label: 'BMP（位图）', extensions: ['bmp'], magickFormat: 'bmp', nativeFormat: 'Bmp', hasQuality: false },
    { value: 'tiff', label: 'TIFF（高质量）', extensions: ['tiff', 'tif'], magickFormat: 'tiff', nativeFormat: 'Tiff', hasQuality: true },
    { value: 'tga', label: 'TGA', extensions: ['tga'], magickFormat: 'tga', nativeFormat: 'Tga', hasQuality: false },
    { value: 'pnm', label: 'PNM / PPM / PGM', extensions: ['pnm', 'ppm', 'pgm', 'pbm'], magickFormat: 'pnm', nativeFormat: 'Pnm', hasQuality: false },
    // 高级/特殊格式（仅 magick）
    { value: 'heic', label: 'HEIC（苹果格式）', extensions: ['heic', 'heif'], magickFormat: 'heic', hasQuality: true, description: '需 ImageMagick（依赖 libheif）' },
    { value: 'avif', label: 'AVIF（下一代格式）', extensions: ['avif'], magickFormat: 'avif', hasQuality: true, description: '需 ImageMagick' },
    { value: 'ico', label: 'ICO（图标）', extensions: ['ico'], magickFormat: 'ico', hasQuality: false },
    { value: 'sgi', label: 'SGI', extensions: ['sgi'], magickFormat: 'sgi', hasQuality: false },
    { value: 'xpm', label: 'XPM', extensions: ['xpm'], magickFormat: 'xpm', hasQuality: false },
    { value: 'xbm', label: 'XBM', extensions: ['xbm'], magickFormat: 'xbm', hasQuality: false },
    { value: 'jp2', label: 'JPEG 2000', extensions: ['jp2', 'j2k', 'jpf', 'jpx'], magickFormat: 'jp2', hasQuality: true },
    { value: 'jxl', label: 'JPEG XL', extensions: ['jxl'], magickFormat: 'jxl', hasQuality: true, description: '需 ImageMagick' },
    { value: 'psd', label: 'PSD（Photoshop）', extensions: ['psd'], magickFormat: 'psd', hasQuality: false, description: '需 ImageMagick' },
    { value: 'pdf', label: 'PDF', extensions: ['pdf'], magickFormat: 'pdf', hasQuality: false, description: '需 ImageMagick + Ghostscript' },
    { value: 'svg', label: 'SVG（矢量）', extensions: ['svg'], magickFormat: 'svg', hasQuality: false, description: '需 ImageMagick（输入端矢量栅格化）' },
    // RAW 格式（仅 magick）
    { value: 'raw', label: 'RAW（通用相机）', extensions: ['raw', 'cr2', 'cr3', 'nef', 'arw', 'dng', 'orf', 'raf', 'rw2', 'pef', 'x3f', 'sr2', 'srw', 'kdc', '3fr', 'erf', 'mef', 'nrw', 'rwl', 'srf', 'iiq', 'mos'], magickFormat: 'raw', hasQuality: true, description: '需 ImageMagick' },
]

/** 根据模式过滤出支持的输出格式 */
export function getOutputFormats(mode: ConvertMode): FormatInfo[] {
    return ALL_FORMATS.filter(f => {
        if (mode === 'magick') return true
        return !!f.nativeFormat
    })
}

/** 根据模式过滤出支持的输入格式（用于 file dialog filter 与拖拽判断） */
export function getInputFormats(mode: ConvertMode): FormatInfo[] {
    return ALL_FORMATS.filter(f => {
        if (mode === 'magick') return true
        return !!f.nativeFormat
    })
}

/** 收集所有支持的输入扩展名（含去重） */
export function getInputExtensions(mode: ConvertMode): string[] {
    const set = new Set<string>()
    for (const f of getInputFormats(mode)) {
        for (const ext of f.extensions) set.add(ext)
    }
    return Array.from(set)
}

/** 收集所有支持的输出扩展名 */
export function getOutputExtensions(mode: ConvertMode): string[] {
    const set = new Set<string>()
    for (const f of getOutputFormats(mode)) {
        for (const ext of f.extensions) set.add(ext)
    }
    return Array.from(set)
}

/** 按 value 查找 FormatInfo */
export function findFormat(value: string): FormatInfo | undefined {
    return ALL_FORMATS.find(f => f.value === value)
}

/** 检查一个扩展名是否被当前模式支持作为输入 */
export function isExtensionSupported(ext: string, mode: ConvertMode): boolean {
    const lower = ext.toLowerCase().replace(/^\./, '')
    const formats = getInputFormats(mode)
    for (const f of formats) {
        if (f.extensions.includes(lower)) return true
    }
    return false
}
