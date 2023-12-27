"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const vue_1 = require("vue");
const lodash_1 = require("lodash");
const panelDataMap = new WeakMap();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
const OUTPUT_DIRECTORY = (0, path_1.join)(__dirname, '../../../data');
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
                        (0, child_process_1.exec)('npm run test');
                        console.log('==== Start reading scene ====');
                        if (!this.sceneDir)
                            return console.log('==== Scene directory is empty ====');
                        const sceneObjArr = getSceneArray(this.sceneDir);
                        console.log('==== Build Pixi Tree From Scene ====');
                        const pixiTree = buildPixiTreeFromSceneArray(sceneObjArr);
                        console.log('==== Build Pixi Tree From Scene Successfully ====');
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
    const nodesArray = sceneArray.filter((sceneObj, index) => {
        return sceneObj.__type__ === 'cc.Node';
    });
    return nodesArray;
}
function buildPixiTreeFromSceneArray(sceneArray) {
    // mutate data on _sceneArr to link components, link nodes
    const _sceneArr = sceneArray.slice();
    for (let index = 0; index < _sceneArr.length; index++) {
        const nodeObj = _sceneArr[index];
        if (!nodeObj || nodeObj.__type__ !== 'cc.Node')
            continue;
        // link components to node
        nodeObj._components.forEach(({ __id__ }, index) => {
            nodeObj._components[index] = _sceneArr[__id__];
            nodeObj._components[index].node = nodeObj;
        });
        // link node to node
        nodeObj._children.forEach(({ __id__ }, index) => {
            nodeObj._children[index] = _sceneArr[__id__];
            _sceneArr[__id__]._parent = nodeObj;
        });
    }
    (0, lodash_1.remove)(_sceneArr, function (sceneObj) {
        if (sceneObj.__type__ !== 'cc.Node')
            return true;
    });
    return _sceneArr;
}
