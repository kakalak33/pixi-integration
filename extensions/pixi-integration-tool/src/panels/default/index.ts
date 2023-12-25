import { PathOrFileDescriptor, outputJSONSync, readFileSync, readJsonSync } from 'fs-extra';
import { join } from 'path';
import { createApp, App } from 'vue';
const panelDataMap = new WeakMap<any, App>();
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
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {},
    ready() {
        if (this.$.app) {
            const app = createApp({
                data() {
                    return {
                        sceneDir: "/Users/fe-tu/Desktop/Personal/Cocos/pixi-integration/assets/scene/home.scene",
                    };
                },
                methods: {
                    onConfirm() {
                        console.log('==== Start reading scene ====');
                        if (!this.sceneDir) return console.log('==== Scene directory is empty ====');

                        const contentArr: Array<SceneObject> = getSceneArray(this.sceneDir);

                        const nodesArr = getNodesFromScene(contentArr);

                        console.log(nodesArr);
                    },
                    handleFileDirectory(e: any) {
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

interface SceneObject {
    __type__: String,
    _active: Boolean,
    _children: Array<any>,
    _components: Array<{ id: number }>,
    _name: String,
    _parent: Array<{ id: number }>,
    /*
    _lpos: {__type__: "cc.Vec3", x: 5, y: -78, z: 0}
    _lrot: {__type__: "cc.Quat", x: 0, y: 0, z: 0, w: 1}
    _lscale: {__type__: "cc.Vec3", x: 1, y: 1, z: 1}
    */
}

function getSceneArray(filePath: PathOrFileDescriptor): Array<SceneObject> {
    const fileContent = readFileSync(filePath, 'utf-8');
    const fileContentArray: Array<SceneObject> = Array.from(JSON.parse(fileContent));
    return fileContentArray;
}

function getNodesFromScene(sceneArray: Array<SceneObject>) {
    const nodesArray = sceneArray.filter((sceneObj: SceneObject) => {
        return sceneObj.__type__ === 'cc.Node';
    });
    return nodesArray || [];
}