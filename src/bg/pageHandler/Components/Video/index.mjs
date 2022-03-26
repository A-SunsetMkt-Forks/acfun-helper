import { importVue } from "../../../../common/modulesLib/SFCUtil.mjs";
import { playerenc } from "./Player.mjs"
import { danmakuenc } from "./Danmaku.mjs"

const sfcData = await importVue("pageHandler/Components/Video/index.vue");
/**@type {import("../../../../../declares/Vue/VueRuntimeCore").Component} */
const app = {
    template: sfcData.template,
    components: {
        playerenc, danmakuenc
    },
    data() {
        return {

        }
    },
    methods: {

    },
    mounted: function () {
        mdui.mutation("div#playerenc");
    }
}
export const videoApp = app