import {mkdir, exists, readDir, remove, rename, writeTextFile, DirEntry} from '@tauri-apps/plugin-fs'
import {homeDir, join} from "@tauri-apps/api/path";
import {Command} from "@tauri-apps/plugin-shell";
import {path} from "@tauri-apps/api";
import {sendNotify} from "./notification";
import {FileOperation} from "./operation-history";


export interface Result {
    rcode: number;
    msg?: string;
    failedNum?: number;
    successNum?: number;
    data?: any;
    operations?: FileOperation[];
}


export interface FConfig {
    tobe_replaced: string;
    replaced_with: string;
    type: number;
    num: number;
    numStart: number;
    numEnd: number;
}

export interface FConfig201 {
    suffix_match: string;
    prefix_add: string;
    suffix_add: string;
    start_num: number;
    keep_original_name: boolean;
}


export async function upgradeFile2Curr(fileDir: string, recursively: boolean, delSubAfter: boolean): Promise<Result> {
    console.log('============ upgradeFile2Curr ============')
    console.log(`fileDir : ${fileDir} ,recursively : ${recursively}`)
    let failedNum = 0;
    const operations: FileOperation[] = [];
    const entries = await readDir(fileDir, {});

    async function processEntries(entries: any, parent: string) {
        for (const entry of entries) {
            console.log(` ===> Entry-name: ${entry.name} , isDirectory: ${entry.isDirectory} isFile: ${entry.isFile}`);
            if (entry.isDirectory && recursively) {
                const children = await join(parent, entry.name);
                const children_entries = await readDir(children, {});

                console.log(`children-name: ${children}`);

                await processEntries(children_entries, children)
                if (delSubAfter) {
                    await remove(children, {})
                        .then(() => {
                            console.log(`删除子文件夹${children}成功`)
                            operations.push({
                                oldPath: children,
                                newPath: '',
                                operationType: 'delete'
                            })
                        }).catch((reason) => {
                            console.log(`删除子文件夹${children}失败：${reason}`)
                        })
                }
            } else {
                const oldPath = await join(parent, entry.name);
                const newPath = await join(fileDir, entry.name);
                await rename(oldPath, newPath).then(() => {
                    console.log(`重命名: ${oldPath} 成功，新路径：${newPath}`)
                    operations.push({
                        oldPath: oldPath,
                        newPath: newPath,
                        operationType: 'move'
                    })
                }).catch((reason) => {
                    failedNum++;
                    console.log(`重命名: ${oldPath} 失败：${reason}`)
                });
            }
        }
    }

    await processEntries(entries, fileDir);

    return {failedNum: failedNum, rcode: 0, operations};
}


// export async function readDirRecursively(fileDir: string): Promise<any> {
//     const entries = await readDir('users', { });
//     processEntriesRecursively(fileDir, entries);
// }
//
// async function processEntriesRecursively(parent:string, entries: DirEntry[]) {
//     for (const entry of entries) {
//         console.log(`Entry: ${entry.name}`);
//         if (entry.isDirectory) {
//             const dir = await join(parent, entry.name);
//             processEntriesRecursively(dir, await readDir(dir, {}))
//         }
//     }
// }

export async function replaceFilename(fileDir: string, fconfig: FConfig): Promise<Result> {
    console.log('============ replaceFilename ============')
    console.log(fileDir)
    console.log(fconfig)

    const entries = await readDir(fileDir);
    const type = fconfig.type
    const tobe_replaced = fconfig.tobe_replaced
    const replaced_with = fconfig.replaced_with
    const num = fconfig.num
    const numStart = fconfig.numStart
    const numEnd = fconfig.numEnd
    let failedNum = 0;
    const operations: FileOperation[] = [];

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

            await rename(oldPath, newPath);
            operations.push({
                oldPath: oldPath,
                newPath: newPath,
                operationType: 'rename'
            })
        }

        for (const entry of entries) {
            console.log(`Entry-name: ${entry.name}`);
            let newPath: string;
            let oldPath: string = await join(fileDir, entry.name);
            if (type == 1) {
                newPath = await join(fileDir, entry.name.replaceAll(tobe_replaced, replaced_with));
            }
            if (type == 2) {
                newPath = await join(fileDir, entry.name.replace(tobe_replaced, replaced_with))
            }
            if (type == 3) {
                // 替换前 x 个字符
                // const prefix = replaced_with.repeat(num);
                newPath = await join(fileDir, replaced_with + entry.name.slice(num));
            }
            if (type == 4) {
                // 替换后 x 个字符
                // const suffix = replaced_with.repeat(num);
                newPath = await join(fileDir, entry.name.slice(0, -num) + replaced_with);
            }
            if (type == 5) {
                // 替换后x个字符(不改变文件后缀名)
                // const suffix = replaced_with.repeat(num);
                const parts = entry.name.split('.');
                const noExt = parts.length == 1;

                const filename = noExt ? entry.name : parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名
                const fileExtension = noExt ? '' : '.' + parts[parts.length - 1]; // 获取最后一个部分作为后缀
                newPath = await join(fileDir, filename.slice(0, -num) + replaced_with + fileExtension);
            }
            if (type == 6) {
                // 添加前缀
                newPath = await join(fileDir, replaced_with + entry.name);
            }
            if (type == 7) {
                // 添加后缀
                const parts = entry.name.split('.');
                const noExt = parts.length == 1;

                const filename = noExt ? entry.name : parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名
                const fileExtension = noExt ? '' : '.' + parts[parts.length - 1]; // 获取最后一个部分作为后缀
                newPath = await join(fileDir, filename + replaced_with + fileExtension);
            }
            if (type == 8) {
                const parts = entry.name.split('.');
                const noExt = parts.length == 1;
                const filename = noExt ? entry.name : parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名
                const fileExtension = noExt ? '' : '.' + parts[parts.length - 1]; // 获取最后一个部分作为后缀
                if (fconfig.numStart > fconfig.numEnd
                    || fconfig.numStart < 0 || fconfig.numEnd < 0
                    || fconfig.numStart > entry.name.length || fconfig.numEnd > entry.name.length) {
                    failedNum++;
                    continue;
                }
                newPath = await join(fileDir, filename.slice(0, numStart - 1) + replaced_with + filename.slice(numEnd) + fileExtension);
            }
            if (type == 9) {
                // 在第 x 个字符后插入
                const parts = entry.name.split('.');
                const noExt = parts.length == 1;

                const filename = noExt ? entry.name : parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名
                const fileExtension = noExt ? '' : '.' + parts[parts.length - 1]; // 获取最后一个部分作为后缀
                newPath = await join(fileDir, filename.slice(0, num) + replaced_with + filename.slice(num) + fileExtension);
            }
            // @ts-ignore
            await renameAndCheck(oldPath, newPath)
        }
    }

    await processEntries(entries);

    return {rcode: 0, failedNum: failedNum, operations};
}

export async function numSortFilename(fileDir: string, fConfig201: FConfig201): Promise<Result> {
    console.log('============ numSortFilename ============')
    console.log(fileDir)
    console.log(fConfig201)

    const entries = await readDir(fileDir);
    const suffix_match = fConfig201.suffix_match
    const prefix_add = fConfig201.prefix_add
    const suffix_add = fConfig201.suffix_add
    const start_num = fConfig201.start_num
    const keep_original_name = fConfig201.keep_original_name;
    let failedNum = 0;
    const operations: FileOperation[] = [];

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

            await rename(oldPath, newPath);
            operations.push({
                oldPath: oldPath,
                newPath: newPath,
                operationType: 'rename'
            })
        }
        let numStart = start_num;
        for (const entry of entries) {
            console.log(`Entry-name: ${entry.name}`);
            const parts = entry.name.split('.');
            const noExt = parts.length == 1;
            const fileExtension = noExt ? '' : parts[parts.length - 1]; // 获取最后一个部分作为后缀
            const filename = keep_original_name ? (noExt ? entry.name : parts.slice(0, -1).join('.')) : ''; // 获取除最后一个部分外的所有部分作为文件名
            let newPath: string;
            let oldPath: string = await join(fileDir, entry.name);
            // 替换后 x 个字符
            if (suffix_match) {
                if (entry.name.endsWith(suffix_match) || entry.name.toLowerCase().endsWith(suffix_match.toLowerCase())) {
                    newPath = await join(fileDir, prefix_add + filename + numStart + suffix_add + '.' + fileExtension);
                } else {
                    continue;
                }
            } else {
                newPath = await join(fileDir, prefix_add + filename + numStart + suffix_add + '.' + fileExtension);
            }
            numStart++;
            // 添加前缀
            // @ts-ignore
            console.log(`Entry-newPath: ${newPath}`);
            await renameAndCheck(oldPath, newPath)
        }
    }

    await processEntries(entries);

    return {rcode: 0, failedNum: failedNum, operations};
}

export async function createTempDirectory() {
    const tempDir = await join(await homeDir(), 'tata-temp');
    const exist = await exists(tempDir)
    if (!exist) {
        await mkdir(tempDir)
    }
    return tempDir;
}

export async function collectFilename(fileDir: string, recursively: boolean, containsSuffix: boolean): Promise<Result> {
    console.log('============ upgradeFile2Curr ============')
    console.log(fileDir)
    console.log(recursively)
    console.log(containsSuffix)

    const txtPath = await join(fileDir, "tata_文件名列表.txt");
    await exists(txtPath).then(() => {
        remove(txtPath);
    }).catch((reason) => {
        console.log(`移除旧文件名列表失败：${reason}`)
    });

    const entries = await readDir(fileDir, {});
    let failedNum = 0;

    async function processEntries(entries: any) {
        for (const entry of entries) {
            console.log(`Entry-name: ${entry.name}`);
            let filename = entry.name;
            if (!containsSuffix) {
                const parts = entry.name.split('.');
                filename = parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名
                // const fileExtension = parts[parts.length - 1]; // 获取最后一个部分作为后缀
                // newPath = await join(fileDir, filename.slice(0, -num) + replaced_with + '.' + fileExtension);
            }
            writeTextFile(txtPath, filename + "\n", {append: true})
                .then(() => {
                    console.log(`写 ${entry.name}成功`)
                }).catch((reason) => {
                failedNum++;
                console.log(`写 ${entry.name}失败：${reason}`)
            });
        }
    }

    await processEntries(entries);
    return {failedNum: failedNum, rcode: 0, data: txtPath};
}

export const merge2Pic = async (img_path: string, zip_path: string, output_path: string): Promise<Result> => {
    // 添加后缀
    const parts = img_path.split('.');
    const noExt = parts.length == 1;
    let _filename = img_path.split('\\').slice(-1)[0];
    const filename = noExt ? _filename : _filename.split('.')[0];
    const fileExtension = noExt ? '' : '.' + parts[parts.length - 1]; // 获取最后一个部分作为后缀

    console.log(_filename)
    console.log(filename)
    console.log(fileExtension)

    const out_full_path = await join(output_path, filename + '_copy' + fileExtension)

    const _cmd = `copy`;
    const _args: string[] = ['/b', `${img_path}+${zip_path}`, `${out_full_path}`];
    return await executeCustomCommand_2(_cmd, _args);
}

export const executeCustomCommand_2 = async (custom_command: string, custom_args: string[]): Promise<Result> => {
    console.log('============ 开始执行自定义命令 ============')
    // const _command: string = custom_command.split(' ')[0];
    const _cmd = '/c' + ' ' + custom_command;
    const args: string[] = _cmd
        .replaceAll('"', '')
        .replaceAll('\'', '')
        .trimStart().trimEnd().split(' ')
    args.push(...custom_args);
    console.log(args)

    let command = Command.create('cmd-c', args, {encoding: 'gbk'});
    console.log(command)

    command.on('close', () => console.log('任务完成 -> execute_custom_command'))
    command.on('error', error => console.error(`command error: "${error}"`));
    command.stdout.on('data', line => console.log(`command stdout: "${line}"`));
    command.stderr.on('data', (line) => console.log(`command stderr: "${line}"`))
    const output = await command.execute()
    console.log('executeCustomCommand_2 output ==> ', output)

    console.log('============ 自定义命令执行完成 ============')
    return {rcode: output.code == undefined ? -1 : output.code, failedNum: 0, data: output.stderr};
}


function convertFileSrc(filePath: string): string {
    // 假设这是一个将文件路径转换为可直接访问的 URL 的函数
    return filePath;
}



