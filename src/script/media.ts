import {Result} from "./filetools";
import {Videoo} from "./mp4ToImg";
import {Command} from "@tauri-apps/api/shell";


export interface MediaConfig {
    audio_scheme?: 'mp3' | 'flac';
    out_video_scheme?: 'mp4' | 'mkv' | 'mov' | '3gp';
    type: number;
    num: number;
    out_path: string;
}

//ffmpeg -i input.mp4 -vn -c:a flac output.flac
export async function video2Audio(mediaConf: MediaConfig, medias: Videoo[]): Promise<Result> {
    console.log('============ video2Audio ============')
    console.log(mediaConf.out_path)
    let failedNum = 0;
    const out_path = mediaConf.out_path;

    async function processEntries(entries: Videoo[]) {
        for (const vd of entries) {
            console.log(`Entry-path: ${vd.path};filename:${vd.name}`);

            let command: Command = Command.sidecar("bin/ffmpeg/ffmpeg", []);
            if (mediaConf.audio_scheme == 'flac') {
                //ffmpeg -i input.mp4 -vn -c:a flac output.flac
                command = Command.sidecar("bin/ffmpeg/ffmpeg",
                    [
                        '-i', vd.path, '-vn',
                        '-c:a', 'flac',
                        `${out_path}\\${vd.name}.flac`]
                    , {encoding: 'utf8'});
            } else {
                //ffmpeg -i input.mp4 -vn -c:a libmp3lame -q:a 0 output.mp3
                command = Command.sidecar("bin/ffmpeg/ffmpeg",
                    [
                        '-i', vd.path, '-vn',
                        '-c:a', 'libmp3lame',
                        '-q:a', '0',
                        `${out_path}\\${vd.name}.mp3`], {encoding: 'utf8'});
            }
            console.log(command)

            command.on('close', () => {
                console.log('任务完成 -> video2Audio')
            })
            command.on('error', error => console.error(`command error: "${error}"`));
            command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
            command.stderr.on('data', (line) => {
                // console.log(line)
            })
            const output = await command.execute()
                .then(() => {
                    vd.stages?.forEach((stage) => {
                        stage.progress = 100;
                        stage.status = 'success'
                    })
                })
                .catch((reason) => {
                    failedNum++;
                    console.log(`error execute command:${reason}`)
                })
                .finally();
            console.log('output.code ==> ', output)
            console.log('============ video2Audio 任务完成 ============')
        }
    }

    await processEntries(medias)

    return {rcode: 1, failedNum: failedNum};
}

//ffmpeg -i video.mp4 -i audio.aac -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 output.mp4

export async function convert(mediaConf: MediaConfig, medias: Videoo[]): Promise<Result> {
    console.log('============ 开始视频格式转换 ============')
    const out_path = mediaConf.out_path;
    let failedNum = 0;

    for (const vd of medias) {
        console.log('basename =====> ' + vd.name)
        console.log('path =====> ' + vd.path)
        console.log('url =====> ' + vd.url)
        let command: Command = Command.sidecar("bin/ffmpeg/ffmpeg",
            [
                '-i', vd.path,
                '-c:v', vd.codingMode || 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                `${out_path}\\${vd.name}${vd.suffix}.${mediaConf.out_video_scheme}`]
            , {encoding: 'utf8'});
        // ffmpeg -i "i.mov" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "o.mp4"
        console.log(command)

        command.on('close', () => console.log('任务完成 -> convert'))
        command.on('error', error => console.error(`command error: "${error}"`));
        command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
        command.stderr.on('data', (line) => console.log(`command stderr: "${line}"`))
        const output = await command.execute()
            .then(() => {
                vd.stages?.forEach((stage) => {
                    stage.progress = 100;
                    stage.status = 'success'
                })
            })
            .catch((reason) => {
                failedNum++;
            })
        console.log('output ==> ', output)
        console.log('============ convert任务完成 ============')
    }

    return {rcode: 1, failedNum: failedNum};
}

export async function executeCustomCommand(custom_command: string): Promise<Result> {
    console.log('============ 开始执行自定义命令 ============')
    const args: string[] = custom_command.replace('ffmpeg', '')
        .replaceAll('"', '')
        .replaceAll('\'', '')
        .trimStart().trimEnd().split(' ');
    let command: Command = Command.sidecar("bin/ffmpeg/ffmpeg", args
        , {encoding: 'utf8'});
    console.log(command)

    command.on('close', () => console.log('任务完成 -> execute_custom_command'))
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', (line) => console.log(`command stderr: "${line}"`))
    const output = await command.execute()
    console.log('output ==> ', output)
    console.log('============ 自定义命令执行完成 ============')
    return {rcode: output.code == undefined ? -1 : output.code, failedNum: 0, data: output.stderr};
}
