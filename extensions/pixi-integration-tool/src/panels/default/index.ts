import { exec } from 'child_process';
import { PathOrFileDescriptor, readFileSync } from 'fs-extra';
import { join } from 'path';
import { createApp, App } from 'vue';
import { remove } from 'lodash';
const panelDataMap = new WeakMap<any, App>();
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
const OUTPUT_DIRECTORY = join(__dirname, '../../../data');
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
                        exec('npm run test');
                        console.log('==== Start reading scene ====');
                        if (!this.sceneDir) return console.log('==== Scene directory is empty ====');
                        const sceneObjArr: Array<SceneObject> = getSceneArray(this.sceneDir);
                        console.log('==== Build Pixi Tree From Scene ====');
                        const pixiTree = buildPixiTreeFromSceneArray(sceneObjArr);
                        console.log('==== Build Pixi Tree From Scene Successfully ====');

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
    _components: Array<{ __id__: number } | any>,
    _name: String,
    _parent: { __id__: number } | any,
    /*
    _lpos: {__type__: "cc.Vec3", x: 5, y: -78, z: 0}
    _lrot: {__type__: "cc.Quat", x: 0, y: 0, z: 0, w: 1}
    _lscale: {__type__: "cc.Vec3", x: 1, y: 1, z: 1}
    */
    treeIndex: number;
}

function getSceneArray(filePath: PathOrFileDescriptor): Array<SceneObject> {
    const fileContent = readFileSync(filePath, 'utf-8');
    const fileContentArray: Array<SceneObject> = Array.from(JSON.parse(fileContent));
    return fileContentArray;
}

function getNodesFromScene(sceneArray: Array<SceneObject>): Array<SceneObject> {
    const nodesArray = sceneArray.filter((sceneObj: SceneObject, index) => {
        return sceneObj.__type__ === 'cc.Node';
    });
    return nodesArray;
}

function buildPixiTreeFromSceneArray(sceneArray: Array<SceneObject>) {
    // mutate data on _sceneArr to link components, link nodes
    const _sceneArr = sceneArray.slice();
    for (let index = 0; index < _sceneArr.length; index++) {
        const nodeObj = _sceneArr[index];
        if (!nodeObj || nodeObj.__type__ !== 'cc.Node') continue;
        // link components to node
        nodeObj._components.forEach(({ __id__ }, index) => {
            nodeObj._components[index] = _sceneArr[__id__];
            nodeObj._components[index].node = nodeObj;
        });
        // link node to node
        nodeObj._children.forEach(({ __id__ }, index) => {
            nodeObj._children[index] = _sceneArr[__id__];
            _sceneArr[__id__]._parent = nodeObj
        });
    }

    remove(_sceneArr, function (sceneObj) {
        if (sceneObj.__type__ !== 'cc.Node') return true;
    });

    return _sceneArr;
}