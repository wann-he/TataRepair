import {createDir, exists, readDir} from '@tauri-apps/api/fs'
import {Command} from '@tauri-apps/api/shell'
import {basename, parse} from 'pathe'
import {convertFileSrc} from "@tauri-apps/api/tauri";
import {path} from "@tauri-apps/api";
import {Result} from "./filetools";

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
    path: string; // 完整路径
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
    model: string; // 模型
    outscale: number; // 放大倍数
    outpath?: string; // 图片输出路径|临时文件存放路径
    prefix?: string; // 图片名前缀
    suffix?: string; // 图片名后缀
}

export const TMP_IMG_DIR = "tmp_img";
export const TMP_4K_DIR = "tmp_img_4k";
export const INIT_STAGES: Stage[] = []


/**
 * 将MP4视频文件转换为一系列图像
 *
 * 此函数异步处理视频文件，提取其帧并转换为图像提取过程包括读取视频文件目录，
 * 如果目录不存在，则创建目录使用FFmpeg工具执行转换，并捕获转换过程的输出
 *
 * @param basePath 基本路径，用于指定文件操作的根目录
 * @param vd 视频文件信息，包括名称、路径和URL
 * @returns 返回一个Promise，解析为包含转换后的图像数组和返回代码的对象
 */
export async function video2Img(basePath: string, vd: Videoo): Promise<Result> {
    const exist = await exists(basePath);
    if (!exist) {
        return {rcode: -1, msg: '文件夹不存在', data: []}
    }
    // 记录开始提取视频帧的信息
    console.log('============ 开始提取视频帧 ============')
    // 读取目录，如果失败则创建目录
    const tmp_dir = await path.join(basePath, TMP_IMG_DIR)
    const tmp_out_path = await path.join(basePath, TMP_IMG_DIR, 'frame%08d.png')

    await readDir(tmp_dir).catch(() => {
        createDir(tmp_dir)
    })
    // 记录视频文件的基本信息
    console.log('name : %s ,path : %s ,url : %s', vd.name, vd.path, vd.url)

    // 构建FFmpeg命令行，用于将视频文件转换为图像序列
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        ['-i', vd.path,
            '-qscale:v', '1',
            '-qmin', '1',
            '-vsync', '0',
            tmp_out_path]
        , {encoding: 'utf8'});

    // 输出FFmpeg命令详细信息
    console.log(command)

    // 监听命令行的关闭事件，通常表示转换完成
    command.on('close', () => {
        console.log('任务完成-video2Img')
    })
    // 监听命令行的错误事件
    command.on('error', error => console.error(`command error: "${error}"`));
    // 监听命令行的标准输出
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    // 监听命令行的错误输出
    command.stderr.on('data', line => console.log(`command stderr: "${line}"`));
    // 执行FFmpeg命令，并等待执行完成
    const output = await command.execute()
    // 记录命令执行结果
    console.log('video2Img_output ==> ', output)
    // 获取转换后的图像列表
    const imgs = await getImages(tmp_dir)
    // 记录图像列表信息
    console.log(imgs)

    // 返回FFmpeg命令的返回代码和转换后的图像列表
    return {rcode: output.code === null ? -1 : output.code, data: imgs}
}


/**
 * 异步获取图片数组
 *
 * 根据提供的文件目录，该函数将异步加载所有的图片文件并返回一个图片对象数组
 * 每个图片对象包含文件名、文件路径和图片的Base64编码字符串
 *
 * @param fileDir 字符串类型的文件目录路径，用于指定从哪里加载图片
 * @returns 返回一个Promise，该Promise解析为Image对象数组
 */
async function getImages(fileDir: string): Promise<Image[]> {
    const exist = await exists(fileDir);
    if (!exist) {
        return []
    }
    const entries = await readDir(fileDir);
    const imgArr: Image[] = []
    entries.forEach(file => {
        if (file.name != null) {
            imgArr.push({url: convertFileSrc(`${file.path}`), percentage: 0, name: `${file.path}`})
        }
    });
    return imgArr;
}

export async function merge2Video(imgPath: string, outPath: string, vd: Videoo): Promise<Result> {
// ffmpeg -i out_frames/frame%08d.jpg -i onepiece_demo.mp4 -map 0:v:0 -map 1:a:0 -c:a copy -c:v libx264 -r 23.98 -pix_fmt yuv420p output_w_audio.mp4
    const isExist = await exists(imgPath) && await exists(outPath)
    if (!isExist) {
        return {rcode: -1, msg: '文件夹不存在', failedNum: 0}
    }
    console.log('============ 开始合并视频流 ============')
    console.log('basename : %s ,path : %s ,url : %s', vd.name, vd.path, vd.url)
    const input_full_path = await path.join(imgPath, 'frame%08d.png')
    const parsed = parse(vd.name)
    console.log('parse(vd.name):', parsed)
    const out_full_path = await path.join(outPath, parsed.name + (vd.suffix || '_tata4kk') + parsed.ext)
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        ['-i', input_full_path,
            '-i', vd.path,
            '-map', '0:v:0',
            '-map', '1:a:0?',
            '-c:a', 'copy',
            '-c:v', vd.codingMode || 'libx264',
            '-r', '23.98',
            '-pix_fmt', 'yuv420p',
            out_full_path]
        , {encoding: 'utf8'});

    console.log(command)

    command.on('close', () => {
        console.log('任务完成 -> merge2Video')
    })
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', (line => console.log(`command stdout: "${line}"`)));
    const output = await command.execute()
    console.log('merge2Video_output ==> ', output)
    console.log('============ 合并视频流完成 ============')
    console.log('============ 任务完成 ============')
    return {rcode: output.code === null ? -1 : output.code}
}


// ./realesrgan-ncnn-vulkan.exe -i input.jpg -o output.png
export async function imgTo4k(mconfig: MConfig, basePath: string, img: Image): Promise<{ rcode: number | null }> {
    const o_path = mconfig.outpath || '';
    const img_prefix = mconfig.prefix || '';

    const out_path = await path.join(basePath, o_path);

    await readDir(out_path).catch(() => {
        createDir(out_path)
    })

    console.log(mconfig)
    const filename = basename(img.name);
    const command = Command.sidecar("bin/realesrgan/realesrgan-ncnn-vulkan",
        ['-i', img.name, '-o', `${out_path}\\${img_prefix}${filename}`, '-n', mconfig.model, '-s', mconfig.outscale + '', '-v'],
        {encoding: 'utf8'});
    console.log(command)
    command.on('close', () => {
        console.log('任务完成 -> imgTo4k')
    })
    // command.on('error', error => console.log('imgTo4k command error:  ', error));

    // command.stderr.on('data', (line) => {
    //     console.log(line)
    //     if (line.includes("%")) {
    //         img.percentage = Number(line.replace("%", ""));
    //         console.log(img.percentage)
    //     }
    //     const regExp = /\S+\s->\s\S+\sdone/;
    //     const match: boolean = regExp.test(line);
    //     if (match) {
    //         img.percentage = 100;
    //         img.status = 'success'
    //     }
    // })

    const output = await command.execute()
    console.log('imgTo4k_command.execute:', output)
    const lines = output.stderr.split(/\r?\n/);

    lines.forEach((line, index) => {
        console.log(`Good_Line ${index + 1}: ${line}`);
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
    });

    return {rcode: 0}
}


export async function getVideoInfo(vd: Videoo) {
    const command = Command.sidecar("bin/ffmpeg/ffmpeg",
        ['-i', vd.path,
            '-hide_banner', '-f',
            'null', '-',
        ], {encoding: 'utf8'});
    command.on('close', () => {
        console.log('任务完成 -> getVideoInfo')
    })
    let output = '';
    // command.on('error', error => console.error(`command error: "${error}"`));
    // command.stdout.on('data', line => console.log(`stdout: "${line}"`));
    //
    // command.stderr.on('data', (line) => {
    //     output = output + line + '\n';
    //     console.log('command error ==> ',  line  )
    // })
    const res = await command.execute()
    console.log('command execute res', res)

    output = res.stderr;

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