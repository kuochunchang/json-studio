import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

// 根據工程規範 6.2：繁重計算 Worker 化
// Monaco Editor 自帶 Worker 支援，我們需要配置全域環境
self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === 'json') {
            return new jsonWorker()
        }
        return new editorWorker()
    }
}

/* 
// 暫時註解，部分版本中類型定義與實際 API 有差異
monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  allowComments: true,
  schemas: []
})
*/
