import {readTextFile, writeTextFile, exists} from '@tauri-apps/plugin-fs'
import {homeDir, join} from '@tauri-apps/api/path'

export interface FileOperation {
    oldPath: string
    newPath: string
    operationType: 'move' | 'rename' | 'delete'
}

export interface OperationHistory {
    id: string
    operationType: 'upgrade' | 'rename' | 'undo'
    timestamp: number
    operations: FileOperation[]
}

const MAX_HISTORY = 3
const HISTORY_FILE_NAME = 'operation_history.json'

async function getHistoryFilePath(): Promise<string> {
    const home = await homeDir()
    return await join(home, HISTORY_FILE_NAME)
}

export async function loadHistory(): Promise<OperationHistory[]> {
    const historyPath = await getHistoryFilePath()
    const exist = await exists(historyPath)
    
    if (!exist) {
        return []
    }
    
    try {
        const content = await readTextFile(historyPath)
        return JSON.parse(content)
    } catch (error) {
        console.error('Failed to load history:', error)
        return []
    }
}

export async function saveHistory(history: OperationHistory[]): Promise<void> {
    const historyPath = await getHistoryFilePath()
    const content = JSON.stringify(history, null, 2)
    await writeTextFile(historyPath, content)
}

export async function addOperation(operationType: 'upgrade' | 'rename', operations: FileOperation[]): Promise<void> {
    const history = await loadHistory()
    
    const newOperation: OperationHistory = {
        id: Date.now().toString(),
        operationType,
        timestamp: Date.now(),
        operations
    }
    
    history.unshift(newOperation)
    
    if (history.length > MAX_HISTORY) {
        history.splice(MAX_HISTORY)
    }
    
    await saveHistory(history)
}

export async function getLatestOperation(): Promise<OperationHistory | null> {
    const history = await loadHistory()
    return history.length > 0 ? history[0] : null
}

export async function removeLatestOperation(): Promise<void> {
    const history = await loadHistory()
    if (history.length > 0) {
        history.shift()
        await saveHistory(history)
    }
}
