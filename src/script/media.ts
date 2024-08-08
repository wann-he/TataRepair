import {exists, readDir, removeDir, removeFile, renameFile} from "@tauri-apps/api/fs";
import {join} from "@tauri-apps/api/path";
import {Result} from "./filetools";
import {MConfig, TMP_4K_DIR, TMP_IMG_DIR, Videoo} from "./mp4ToImg";
import {basename} from "pathe";
import {Command} from "@tauri-apps/api/shell";


export interface VConfig {
    tobe_replaced: string;
    replaced_with: string;
    type: number;
    num: number;
    deleteOld: boolean;
}

export async function transferVideo(fileDir: string, fconfig: VConfig, medias: Videoo[]): Promise<Result> {
    console.log('============ replaceFilename ============')
    console.log(fileDir)
    console.log(fconfig)

    const entries = await readDir(fileDir);
    const type = fconfig.type
    const tobe_replaced = fconfig.tobe_replaced
    const replaced_with = fconfig.replaced_with
    const num = fconfig.num
    let failedNum = 0;

    async function processEntries(entries: any) {
        const renameAndCheck = async (oldPath: string, newPath: string) => {
            const exist = await exists(newPath)
            console.log(`exist: ${exist}`);
            if (exist) {
                failedNum++;
                return;
            }
            console.log(`oldPath: ${oldPath}`);
            console.log(`newPath: ${newPath}`);

            await renameFile(oldPath, newPath);
        }

        for (const entry of entries) {
            console.log(`Entry: ${entry.path}`);
            console.log(`Entry-name: ${entry.name}`);
            let newPath: string;
            if (type == 1) {
                newPath = await join(fileDir, entry.name.replaceAll(tobe_replaced, replaced_with));
            }
            // @ts-ignore
            await renameAndCheck(entry.path, newPath)
        }
    }

    await processEntries(entries);

    return {rcode: 1, failedNum: failedNum};
}


export async function convert(vconf: VConfig, basePath: string, outPath: string, vd: Videoo) {
    console.log('============ 开始合并视频流 ============')
    const filename = basename(vd.name);
    console.log('basename =====> ' + filename)
    console.log('path =====> ' + vd.name)
    console.log('url =====> ' + vd.url)
    //    ffmpeg -i "%%i" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "%%~ni.mp4"
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        [
            '-i', vd.name,
            '-c:v', vd.codingMode || 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            // '-map', '0:v:0',
            // '-map', '1:a:0',
            // '-r', '23.98',
            // '-pix_fmt', 'yuv420p',
            `${outPath}\\${filename}${vd.suffix}.mp4`]);

    console.log(command)

    command.on('close', () => {
        console.log('任务完成 -> convert')
    })
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', (line) => {
        // console.log(line)
    })
    const output = await command.execute()
    console.log('output.code ==> ' + output.code)
    console.log('============ convert任务完成 ============')
    // 删除临时文件夹目录
    if (vconf.deleteOld) {
        await removeFile(`${vd.name}`, {}).catch((reason) => {
            console.log(`删除旧文件${vd.name}失败：${reason}`)
        })
    }

    return {rcode: output.code}
}