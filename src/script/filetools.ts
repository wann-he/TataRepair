import {exists, readDir, removeDir, renameFile} from '@tauri-apps/api/fs'
import {join} from "@tauri-apps/api/path";

// import {convertFileSrc} from "@tauri-apps/api/tauri";

export interface Result {
    rcode: number;
    msg?: string;
    failedNum?: number;
    successNum?: number;
    data?: any;
}


export interface FConfig {
    tobe_replaced: string;
    replaced_with: string;
    type: number;
    num: number;
}

export async function upgradeFile2Curr(fileDir: string, recursively: boolean, delSubAfter: boolean): Promise<Result> {
    console.log('============ upgradeFile2Curr ============')
    console.log(fileDir)
    console.log(recursively)
    let failedNum = 0;

    const entries = await readDir(fileDir, {recursive: recursively});

    async function processEntries(entries: any) {
        for (const entry of entries) {
            console.log(`Entry: ${entry.path}`);
            console.log(`Entry-name: ${entry.name}`);
            if (entry.children && recursively) {
                await processEntries(entry.children)
                if (delSubAfter) {
                    await removeDir(entry.path, {})
                        .then(() => {
                            console.log(`删除子文件夹${entry.path}成功`)
                        }).catch((reason) => {
                            console.log(`删除子文件夹${entry.path}失败：${reason}`)
                        })
                }
            } else {
                const newPath = await join(fileDir, entry.name);
                await renameFile(entry.path, newPath).then(() => {
                    console.log(`重命名${entry.path}成功，新路径：${newPath}`)
                }).catch((reason) => {
                    failedNum++;
                    console.log(`重命名${entry.path}失败：${reason}`)
                });
            }
        }
    }

    await processEntries(entries);

    return {failedNum: 0, rcode: 1};
}

export async function replaceFilename(fileDir: string, fconfig: FConfig): Promise<Result> {
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
                const parts = entry.name.split('.');
                const fileExtension = parts[parts.length - 1]; // 获取最后一个部分作为后缀
            }
            if (type == 5) {
                // 替换后 x 个字符
                // const suffix = replaced_with.repeat(num);
                const parts = entry.name.split('.');
                const filename = parts.slice(0, -1).join('.'); // 获取除最后一个部分外的所有部分作为文件名
                const fileExtension = parts[parts.length - 1]; // 获取最后一个部分作为后缀
                newPath = await join(fileDir, filename.slice(0, -num) + replaced_with + '.' + fileExtension);
            }
            if (type == 6) {
                // 添加前缀
                newPath = await join(fileDir, replaced_with + entry.name);
            }
            if (type == 7) {
                // 添加后缀
                newPath = await join(fileDir, entry.name + replaced_with);
            }
            // @ts-ignore
            await renameAndCheck(entry.path, newPath)
        }
    }

    await processEntries(entries);

    return {rcode: 1, failedNum: failedNum};
}


function convertFileSrc(filePath: string): string {
    // 假设这是一个将文件路径转换为可直接访问的 URL 的函数
    return filePath;
}



