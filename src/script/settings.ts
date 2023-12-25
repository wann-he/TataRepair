import {resolveResource} from '@tauri-apps/api/path'
// alternatively, use `window.__TAURI__.path.resolveResource`
import {BaseDirectory, readTextFile, writeTextFile} from '@tauri-apps/plugin-fs'
import {ChatModelVal} from "./constants";
import {sendNotify} from "./notification";
import type {ConvertMode} from "./imageFormats";

// alternatively, use `window.__TAURI__.fs.readTextFile`
export interface UserConf {
    gpt: {
        ak: string;
        model: 'gpt-3.5-turbo-1106' | 'gpt-4o-mini';
    },
    qwen: {
        ak: string;
        models: string[];
        optional_models: string[];
    },
    img_convert: {
        mode: ConvertMode;
        magick_path: string; // magick 可执行文件绝对路径，留空则 PATH 查找
    }
}


export async function readConfig(): Promise<UserConf> {
    // `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
    const resourcePath = await resolveResource('conf/user.conf')
    const raw = await readTextFile(resourcePath)
    let conf: any
    try {
        conf = JSON.parse(raw)
    } catch (e) {
        console.error('配置解析失败', e)
        conf = {}
    }
    // 兜底默认配置，避免老用户没有 img_convert 字段导致运行报错
    if (!conf.img_convert) {
        conf.img_convert = { mode: 'native', magick_path: '' }
    }
    if (!conf.gpt) conf.gpt = { ak: '', model: 'gpt-3.5-turbo-1106' }
    if (!conf.qwen) conf.qwen = { ak: '', models: [], optional_models: [] }
    console.log(conf) // This will print 'Guten Tag!' to the devtools console
    return conf
}

export async function ffmpegPrompt(): Promise<string> {
    const resourcePath = await resolveResource('conf/ffmpeg.prompt')
    return await readTextFile(resourcePath)
}


export async function setConfig(conf: UserConf): Promise<any> {
    // `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
    const resourcePath = await resolveResource('conf/user.conf')
    await writeTextFile(resourcePath, JSON.stringify(conf), {append: false})
        .then(() => {
            console.log('写配置成功')
        })
        .catch((e) => {
            sendNotify('写配置失败' + e);
            console.log(e)
        })
    console.log(conf) // This will print 'Guten Tag!' to the devtools console
    return conf
}