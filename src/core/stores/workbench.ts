import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed } from 'vue'
import type { JsonFile } from '../types'

// Re-export for backward compatibility
export type { JsonFile } from '../types'

export const useWorkbenchStore = defineStore('workbench', () => {
    // State: Persisted in LocalStorage
    const files = useLocalStorage<JsonFile[]>('json-toolbox-files', [
        {
            id: 'default-1',
            name: 'example.json',
            content: '{\n  "message": "Hello World",\n  "status": 200\n}',
            language: 'json',
            createdAt: Date.now()
        }
    ])

    const activeFileId = useLocalStorage<string>('json-toolbox-active-id', 'default-1')

    // Track which files are open as tabs (separate from all files)
    const openFileIds = useLocalStorage<string[]>('json-toolbox-open-ids', ['default-1'])

    // Getters
    const activeFile = computed(() => {
        if (!activeFileId.value) return null
        return files.value.find(f => f.id === activeFileId.value) || null
    })

    // Get only the files that are open as tabs
    const openFiles = computed(() => {
        return openFileIds.value
            .map(id => files.value.find(f => f.id === id))
            .filter((f): f is JsonFile => f !== undefined)
    })

    // Actions
    function createFile(name: string = 'Untitled', content: string = '') {
        const newFile: JsonFile = {
            id: uuidv4(),
            name,
            content,
            language: 'json',
            createdAt: Date.now()
        }
        files.value.push(newFile)
        // Also open the new file as a tab
        openFileIds.value.push(newFile.id)
        activeFileId.value = newFile.id
        return newFile
    }

    function updateFileContent(id: string, content: string) {
        const file = files.value.find(f => f.id === id)
        if (file) {
            file.content = content
        }
    }

    function renameFile(id: string, newName: string) {
        const file = files.value.find(f => f.id === id)
        if (file) {
            file.name = newName
        }
    }

    // Open a file as a tab (from sidebar)
    function openFile(id: string) {
        if (!openFileIds.value.includes(id)) {
            openFileIds.value.push(id)
        }
        activeFileId.value = id
    }

    // Close a tab (does NOT delete the file)
    function closeFile(id: string) {
        const index = openFileIds.value.indexOf(id)
        if (index !== -1) {
            openFileIds.value.splice(index, 1)

            // If we closed the active file, switch to another open tab
            if (activeFileId.value === id) {
                if (openFileIds.value.length > 0) {
                    const newActiveId = openFileIds.value[Math.max(0, index - 1)] || openFileIds.value[0]
                    activeFileId.value = newActiveId
                } else {
                    activeFileId.value = ''
                }
            }
        }
    }

    // Delete a file permanently (from sidebar)
    function deleteFile(id: string) {
        const index = files.value.findIndex(f => f.id === id)
        if (index !== -1) {
            files.value.splice(index, 1)

            // Also close the tab if it's open
            const openIndex = openFileIds.value.indexOf(id)
            if (openIndex !== -1) {
                openFileIds.value.splice(openIndex, 1)
            }

            // If we deleted the active file, switch to another open one
            if (activeFileId.value === id) {
                activeFileId.value = openFileIds.value[0] || ''
            }
        }
    }

    function setActiveFile(id: string) {
        // Also open the file if it's not already open
        if (!openFileIds.value.includes(id)) {
            openFileIds.value.push(id)
        }
        activeFileId.value = id
    }

    return {
        files,
        activeFileId,
        activeFile,
        openFileIds,
        openFiles,
        createFile,
        updateFileContent,
        renameFile,
        openFile,
        closeFile,
        deleteFile,
        setActiveFile
    }
})
