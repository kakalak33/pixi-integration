"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                data() {
                    return {
                        sceneDir: "/Users/fe-tu/Desktop/Personal/Cocos/pixi-integration/assets/scene/home.scene",
                    };
                },
                methods: {
                    onConfirm() {
                        console.log('==== Start reading scene ====');
                        if (!this.sceneDir)
                            return console.log('==== Scene directory is empty ====');
                        const contentArr = getSceneArray(this.sceneDir);
                        const nodesArr = getNodesFromScene(contentArr);
                        console.log(nodesArr);
                    },
                    handleFileDirectory(e) {
                        if (e.target.value) {
                            this.sceneDir = e.target.value;
                        }
                    },
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
});
function getSceneArray(filePath) {
    const fileContent = (0, fs_extra_1.readFileSync)(filePath, 'utf-8');
    const fileContentArray = Array.from(JSON.parse(fileContent));
    return fileContentArray;
}
function getNodesFromScene(sceneArray) {
    const nodesArray = sceneArray.filter((sceneObj) => {
        return sceneObj.__type__ === 'cc.Node';
    });
    return nodesArray || [];
}
