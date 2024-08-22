import {resolveResource} from '@tauri-apps/api/path'
// alternatively, use `window.__TAURI__.path.resolveResource`
import {BaseDirectory, readTextFile, writeTextFile} from '@tauri-apps/api/fs'
import {ChatModelVal} from "./constants";
import {sendNotify} from "./notification";

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
    }
}


export async function readConfig(): Promise<UserConf> {
    // `lang/de.json` is the value specified on `tauri.conf.json > tauri > bundle > resources`
    const resourcePath = await resolveResource('conf/user.conf')
    const conf = JSON.parse(await readTextFile(resourcePath))
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