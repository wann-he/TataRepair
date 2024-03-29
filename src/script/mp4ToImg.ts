import {createDir, readDir, removeDir} from '@tauri-apps/api/fs'
import {Command} from '@tauri-apps/api/shell'
import {basename} from 'pathe'
import {convertFileSrc} from "@tauri-apps/api/tauri";

export interface Image {
    url: string;
    name: string;
    percentage?: number;
    status?: string;
    alt?: string; // 可选的属性
}

export interface Videoo {
    url: string;
    name: string;
    percentage?: number;
    status?: string;
    alt?: string; // 可选的属性
    stages?: Stage[];
    duration?: string; // 时长
    frameRate?: string; // 帧率
    resolution?: string; // 分辨率
    frames?: string;// 总帧数
    codingMode?: string;// 编码方式,默认为libx264
    suffix?: string;// 导出视频后缀
}

export interface Stage {
    progress: number;
    name: string;
    status?: string;
}

export interface MConfig {
    model: string;
    outscale: number;
    outpath?: string; // 图片输出路径
    prefix?: string; // 图片名前缀
}

export const TMP_IMG_DIR = "tmp_img";
export const TMP_4K_DIR = "tmp_img_4k";
export const INIT_STAGES: Stage[] = []


export async function mp4ToImgV2(mconfig: MConfig, basePath: string, vd: Videoo): Promise<{
    images: Image[];
    rcode: number | null
}> {
    console.log('============ 开始提取视频帧 ============')
    await readDir(`${basePath}/${TMP_IMG_DIR}`).catch(() => {
        createDir(`${basePath}/${TMP_IMG_DIR}`)
    })
    // console.log(mconfig.model)
    // console.log(mconfig.outscale)
    const filename = basename(vd.name);
    console.log('basename =====> ' + filename)
    console.log('path =====> ' + vd.name)
    console.log('url =====> ' + vd.url)
    // const cmd = `${ffmpegPath} -i ${file} -qscale:v 1 -qmin 1 -qmax 1 -vsync 0 ${basePath}/test/frame%08d.png`
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        ['-i', vd.name,
            '-qscale:v', '1',
            '-qmin', '1',
            '-vsync', '0',
            `${basePath}\\${TMP_IMG_DIR}\\frame%08d.png`]);

    console.log(command)

    command.on('close', () => {
        console.log('任务完成-mp4ToImgV2')
    })
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', (line) => {
        console.log(line)
    })
    const output = await command.execute()
    console.log('output.code ==> ' + output.code)

    const imgs = await getImages(`${basePath}\\tmp_img`)
    console.log(imgs)

    return {rcode: output.code, images: imgs}
}


async function getImages(fileDir: string): Promise<Image[]> {
    const entries = await readDir(fileDir);
    const imgArr: Image[] = []
    entries.forEach(file => {
        if (file.name != null) {
            imgArr.push({url: convertFileSrc(`${file.path}`), percentage: 0, name: `${file.path}`})
        }
    });
    return imgArr;
}

export async function merge2Video(mconfig: MConfig, basePath: string, outPath: string, vd: Videoo) {
// ffmpeg -i out_frames/frame%08d.jpg -i onepiece_demo.mp4 -map 0:v:0 -map 1:a:0 -c:a copy -c:v libx264 -r 23.98 -pix_fmt yuv420p output_w_audio.mp4
    console.log('============ 开始合并视频流 ============')
    const filename = basename(vd.name);
    console.log('basename =====> ' + filename)
    console.log('path =====> ' + vd.name)
    console.log('url =====> ' + vd.url)
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        ['-i', `${basePath}\\${TMP_4K_DIR}\\frame%08d.png`,
            '-i', vd.name,
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-c:a', 'copy',
            '-c:v', vd.codingMode || 'libx264',
            '-r', '23.98',
            '-pix_fmt', 'yuv420p',
            `${outPath}\\${filename}${vd.suffix}.mp4`]);

    console.log(command)

    command.on('close', () => {
        console.log('任务完成 -> merge2Video')
    })
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', (line) => {
        // console.log(line)
    })
    const output = await command.execute()
    console.log('output.code ==> ' + output.code)
    console.log('============ 合并视频流完成 ============')
    console.log('============ 任务完成 ============')
    // 删除临时文件夹目录
    const res1 = await removeDir(`${basePath}/${TMP_IMG_DIR}`, {recursive: true}).catch((reason) => {
        console.log(`删除临时文件夹${TMP_IMG_DIR}失败：${reason}`)
    })
    const res2 = await removeDir(`${basePath}/${TMP_4K_DIR}`, {recursive: true}).catch((reason) => {
        console.log(`删除临时文件夹${TMP_4K_DIR}失败：${reason}`)
    })
    return {rcode: output.code}
}

// ./realesrgan-ncnn-vulkan.exe -i input.jpg -o output.png
export async function imgTo4k(mconfig: MConfig, basePath: string, img: Image): Promise<{ rcode: number | null }> {
    const o_path = mconfig.outpath || '';
    const img_prefix = mconfig.prefix || '';

    await readDir(`${basePath}/${o_path}`).catch(() => {
        createDir(`${basePath}/${o_path}`)
    })
    // console.log(mconfig.model)
    // console.log(mconfig.outscale)
    const filename = basename(img.name);
    const command = Command.sidecar("bin/realesrgan/realesrgan-ncnn-vulkan",
        ['-i', img.name, '-o', `${basePath}\\${o_path}\\${img_prefix}${filename}`, '-n', mconfig.model, '-s', mconfig.outscale + '', '-v']);
    command.on('close', () => {
        console.log('任务完成')
    })
    command.stderr.on('data', (line) => {
        // console.log(line)
        if (line.includes("%")) {
            img.percentage = Number(line.replace("%", ""));
            console.log(img.percentage)
        }
        const regExp = /\S+\s->\s\S+\sdone/;
        const match: boolean = regExp.test(line);
        if (match) {
            img.percentage = 100;
            img.status = 'success'
        }
    })
    const output = await command.execute()
    // console.log('output.code ==> ' + output.code)
    return {rcode: output.code}
}


let ffmpegOutput = `Your FFmpeg Output Here`;

// console.log(parseFfmpegOutput(ffmpegOutput));
export async function getVideoInfo(vd: Videoo) {
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        ['-i', vd.name,
            '-hide_banner', '-f',
            'null', '-',
        ]);
    console.log(command)
    command.on('close', () => {
        console.log('任务完成 -> merge2Video')
    })
    let output = '';
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`stdout: "${line}"`));

    command.stderr.on('data', (line) => {
        output = output + line + '\n';
        console.log(line)
    })
    const res = await command.execute()

    const duration = output.match(/Duration: (.*?),/);
    let videoDuration = duration ? duration[1] : ''; // 00:00:05.02

    const resolutionFrameRate = output.match(/, (\d+x\d+),/);
    let videoResolution = resolutionFrameRate ? resolutionFrameRate[1] : ''; // 2560x1440

    const videoFrameRate = output.match(/(\d+(.{1}\d+)) fps/);
    let rate = videoFrameRate ? videoFrameRate[1] : ''; // 23.98

    const totalFrames = output.match(/frame=(\s*\d*)/);
    let videoTotalFrames = totalFrames ? totalFrames[1].trim() : undefined; // e.g., 102

    vd.duration = videoDuration;
    vd.resolution = videoResolution;
    vd.frameRate = rate;
    vd.frames = videoTotalFrames;
    return vd;
}


// 定义ThreadPool类
export class ThreadPool {
    private max: number;
    private running: number;
    private queue: Array<() => Promise<any>>;
    private completed: number;
    private total: number;

    constructor(max: number) {
        this.max = max;
        this.running = 0;
        this.queue = [];
        this.completed = 0;
        this.total = 0;
    }

    run(promise: () => Promise<any>) {
        this.total += 1;
        this.queue.push(() => promise()
            .then(result => {
                this.completed += 1;
                return result;
            }));
        this.next();
    }

    private next() {
        if (this.running >= this.max || !this.queue.length) {
            return;
        }

        const promise = this.queue.shift()!;
        this.running++;
        promise()
            .finally(() => {
                this.running--;
                this.next();
            });
    }

    getProgress() {
        return this.completed / this.total;  // 返回执行进度
    }

    isDone(): Promise<void> {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.running === 0 && this.queue.length === 0) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
}


// // 创建命令实例
// const command = new Command(realesrgan, ['-i', file, '-o', `${basePath}/test/4kk_${file}`]);
// // 监听命令输出
// command.stdout.on('data', (line) => {
//     console.log(`标准输出：${line}`);
// });
// command.stderr.on('data', (line) => {
//     console.error(`标准错误输出：${line}`);
// });
// // 监听命令退出
// command.on('close', (code) => {
//     console.log(`命令执行完成，退出码：${code}`);
// });
// // 使用 spawn() 方法运行命令
// command.spawn()
//     .then(({ pid }) => console.log(`命令的进程 ID 是：${pid}`))
//     .catch((err) => console.error(`无法运行命令：${err}`));