import {rename, exists, mkdir} from '@tauri-apps/plugin-fs'
import {FileOperation, OperationHistory} from './operation-history'

export async function undoOperation(operation: OperationHistory): Promise<{success: boolean, failedNum: number}> {
    let failedNum = 0
    
    for (const op of operation.operations) {
        try {
            if (op.operationType === 'delete') {
                await mkdir(op.oldPath, {recursive: true})
            } else {
                const newExists = await exists(op.newPath)
                if (newExists) {
                    await rename(op.newPath, op.oldPath)
                } else {
                    console.warn(`File not found: ${op.newPath}`)
                    failedNum++
                }
            }
        } catch (error) {
            console.error(`Failed to undo operation: ${op.oldPath} -> ${op.newPath}`, error)
            failedNum++
        }
    }
    
    return {success: failedNum === 0, failedNum}
}
