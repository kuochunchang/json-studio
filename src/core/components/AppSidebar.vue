<script setup lang="ts">
import { FileCode2, FolderOpen, GalleryVerticalEnd, HelpCircle, PanelTop, Settings2, Trash2, Wrench, X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useWorkbenchStore } from '../stores/workbench'

const store = useWorkbenchStore()
const { files, activeFileId } = storeToRefs(store)
const showHelp = ref(false)
const showSettings = ref(false)
const confirmReset = ref(false)

const handleResetData = (event: Event) => {
  event.stopPropagation()
  if (!confirmReset.value) {
    confirmReset.value = true
    return
  }
  
  localStorage.clear()
  window.location.reload()
}

const cancelReset = () => {
  confirmReset.value = false
}

const handleFileClick = (id: string) => {
  store.setActiveFile(id)
}

const handleDeleteFile = (id: string, event: Event) => {
  event.stopPropagation() // Prevent triggering file selection
  store.deleteFile(id)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo">
        <GalleryVerticalEnd :size="20" class="logo-icon text-primary" />
        <span class="logo-text">JSON Studio</span>
      </div>
    </div>
    
    <div class="sidebar-content">
      <div class="section-title">SCRATCHPAD</div>
      <div class="file-list">
        <div 
          v-for="file in files" 
          :key="file.id"
          class="file-item" 
          :class="{ active: file.id === activeFileId }"
          @click="handleFileClick(file.id)"
        >
          <FileCode2 :size="16" class="file-icon" />
          <span class="file-name">{{ file.name }}</span>
          <button 
            class="delete-btn"
            title="Delete file"
            @click="handleDeleteFile(file.id, $event)"
          >
            <X :size="14" />
          </button>
        </div>
      </div>
    </div>


    <div class="sidebar-footer">
      <div class="footer-item" @click="showHelp = true">
        <HelpCircle :size="16" />
        <span>Help</span>
      </div>
      <div class="footer-item" @click="showSettings = true">
        <Settings2 :size="16" />
        <span>Settings</span>
      </div>
    </div>

    <!-- Help Modal -->
    <Teleport to="body">
      <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Quick Guide</h3>
            <button class="close-modal" @click="showHelp = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <section>
              <h4 class="section-h"><FolderOpen :size="18" class="h-icon" /> Managing Files</h4>
              <p>Files in <b>SCRATCHPAD</b> are saved automatically to your browser. Use the <b>+</b> icon to create new ones.</p>
            </section>
            <section>
              <h4 class="section-h"><PanelTop :size="18" class="h-icon" /> Tabs vs. Permanent Delete</h4>
              <ul>
                <li><b>Close Tab:</b> Click "X" on a tab to hide it. The file remains in the sidebar.</li>
                <li><b>Delete File:</b> Hover over the file in the sidebar and click <Trash2 :size="12" style="display:inline" /> to delete it permanently.</li>
              </ul>
            </section>
            <section>
              <h4 class="section-h"><Wrench :size="18" class="h-icon" /> Tools</h4>
              <ul>
                <li><b>Viewer:</b> Search and explore the JSON tree.</li>
                <li><b>Table:</b> View arrays as spreadsheet-style tables.</li>
                <li><b>Query:</b> Filter data using JSONPath.</li>
                <li><b>Diff:</b> Compare two JSON structures.</li>
              </ul>
            </section>
          </div>
          <div class="modal-footer">
            <button class="primary-btn" @click="showHelp = false">Got it!</button>
          </div>
        </div>
      </div>
      
      <!-- Settings Modal -->
      <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Settings</h3>
            <button class="close-modal" @click="showSettings = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <section>
              <h4>Data Storage</h4>
              <p>All your data is stored locally in your browser (LocalStorage). We do not upload your JSON to any server.</p>
              <div class="setting-action">
                <button 
                  class="danger-btn" 
                  :class="{ 'confirming': confirmReset }"
                  @click="handleResetData($event)"
                  @mouseleave="cancelReset"
                >
                  {{ confirmReset ? 'Click again to confirm' : 'Reset All Data' }}
                </button>
                <p class="hint">This will permanently delete all scratchpad files.</p>
              </div>
            </section>
            
            <section>
              <h4>About</h4>
              <p><b>JSON Studio v1.0.0</b></p>
              <p>A fast, browser-based JSON processing toolkit.</p>
            </section>
          </div>
          <div class="modal-footer">
            <button class="primary-btn" @click="showSettings = false">Done</button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.sidebar-content {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.section-title {
  padding: 0 1rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all 0.2s;
  position: relative;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
}

.file-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
}

.file-item:hover {
  background-color: var(--zinc-800);
  color: var(--text-primary);
}

.file-item.active {
  background-color: var(--zinc-800);
  color: var(--primary);
  border-left: 2px solid var(--primary);
  padding-left: calc(1rem - 2px);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border-subtle);
}

.footer-item {
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  transition: color 0.2s;
}

.footer-item:hover {
  color: var(--primary);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-panel);
  width: 90%;
  max-width: 500px;
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--primary);
}

.close-modal {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.close-modal:hover {
  background-color: var(--zinc-800);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-body section {
  margin-bottom: 1.5rem;
}

.modal-body h4.section-h {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  color: var(--primary);
}

.h-icon {
  color: var(--primary);
  opacity: 0.9;
}

.modal-body p, .modal-body ul {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.modal-body ul {
  padding-left: 1.2rem;
  margin-top: 0.5rem;
}

.modal-body li {
  margin-bottom: 0.4rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  justify-content: flex-end;
}

.primary-btn {
  background-color: var(--primary);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;
}

.primary-btn:hover {
  filter: brightness(1.1);
}

.danger-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;
}

.danger-btn:hover {
  filter: brightness(1.1);
}

.danger-btn.confirming {
  background-color: #dc2626;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.setting-action {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
}

.hint {
  margin-top: 0.5rem !important;
  font-size: 0.8rem !important;
  color: var(--text-muted) !important;
}
</style>
