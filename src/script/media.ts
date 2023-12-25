import {Result} from "./filetools";
import {Videoo} from "./mp4ToImg";
import {Command} from "@tauri-apps/plugin-shell";


export interface MediaConfig {
    audio_scheme?: 'mp3' | 'flac';
    out_video_scheme?: 'mp4' | 'mkv' | 'mov' | '3gp';
    type: number;
    num: number;
    out_path: string;
    speed: number;
    use_gpu?: boolean;
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

            let command = Command.sidecar("bin/ffmpeg/ffmpeg", []);
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
// useGpu

export async function convert(mediaConf: MediaConfig, medias: Videoo[]): Promise<Result> {
    console.log('============ 开始视频格式转换 ============')
    const out_path = mediaConf.out_path;
    let failedNum = 0;
    let codingMode = mediaConf.use_gpu ? 'hevc_nvenc' : 'libx264';
    for (const vd of medias) {
        console.log('basename =====> ' + vd.name)
        console.log('path =====> ' + vd.path)
        console.log('url =====> ' + vd.url)
        const parts = vd.name.split('.');
        const filename = parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名

        let command;

        // ffmpeg -i .\p01.mp4 -vf "setpts=PTS/(1.5)" -af "atempo=1.5" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k p01x1.5_2.mp4
        let args: string | string[];
        if (vd.bitrate) {
            args = ['-y',
                '-i', vd.path,
                '-c:v', codingMode,
                '-b:v', vd.bitrate,
                '-c:a', 'aac',
                '-b:a', '128k',
                `${out_path}\\${filename}${vd.suffix}.${mediaConf.out_video_scheme}`]
        } else {
            args = ['-y',
                '-i', vd.path,
                '-c:v', codingMode,
                '-preset', 'medium',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                `${out_path}\\${filename}${vd.suffix}.${mediaConf.out_video_scheme}`]
        }
        if (mediaConf.speed !== 1) {
            const speedArg = ['-vf', "setpts=PTS/(" + mediaConf.speed + ")", '-af', "atempo=" + mediaConf.speed]
            args.splice(3, 0, ...speedArg);

        }
        command = Command.sidecar("bin/ffmpeg/ffmpeg", args, {encoding: 'utf8'});
        // ffmpeg -y -i "i.mov" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k "o.mp4"
        console.log(command)

        command.on('close', () => console.log('任务完成 -> convert'))
        command.on('error', error => console.error(`command error: "${error}"`));
        command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
        command.stderr.on('data', (line) => console.log(`command stderr: "${line}"`))
        const output = await command.execute()
        console.log('output ==> ', output)
        if (output.code !== 0) {
            failedNum++;
        } else {
            vd.stages?.forEach((stage) => {
                stage.progress = 100;
                stage.status = 'success'
            })
        }
        console.log('============ convert任务完成 ============')
    }

    return {rcode: 0, failedNum: failedNum};
}

export async function executeCustomCommand(custom_command: string): Promise<Result> {
    console.log('============ 开始执行自定义命令 ============')
    const args: string[] = custom_command.replace('ffmpeg', '')
        .replaceAll('"', '')
        .replaceAll('\'', '')
        .trimStart().trimEnd().split(' ');
    let command = Command.sidecar("bin/ffmpeg/ffmpeg", args
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


export async function executeCustomCommand_2(custom_command: string): Promise<Result> {
    console.log('============ 开始执行自定义命令 ============')
    // const _command: string = custom_command.split(' ')[0];
    const _cmd = '/c ' + custom_command;
    const args: string[] = _cmd
        .replaceAll('"', '')
        .replaceAll('\'', '')
        .trimStart().trimEnd().split(' ')
     let command = Command.create('cmd-c', args
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
