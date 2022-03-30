import { importVue } from "../../../../common/modulesLib/SFCUtil.mjs"
import { userAddWrap } from "../Modules/Utils.mjs"

/**@type {import("../../../../../declares/Vue/VueRuntimeCore").Component} */
const app = {
    template: (await importVue("pageHandler/Components/Utils/UserTag.vue")).template,
    data() {
        return {
            /**@type {[{bananaNum:string,name:string,uid:string,up_url:string}]} */
            raw: [],
            memberNum: 0,
            uidError: false,
            uidErrorMsg: "不能为空",
        }
    },
    methods: {
        remove: function (e) {
            /**@type {HTMLElement} */
            const target = e.target;
            const backup = target.cloneNode(true);
            delete this.raw[target.dataset.key]

            mdui.snackbar({
                message: '已将 ' + target.dataset.name + " 移除列表，通知消失后将会写入配置。",
                buttonText: '撤销',
                onButtonClick: async () => {
                    this.raw[backup.dataset.key] = {
                        name: backup.dataset.name,
                        desc: backup.dataset.desc,
                        tag: backup.dataset.tag,
                        refer: backup.dataset.refer,
                        evidence: backup.dataset.evidence,
                        commentId: backup.dataset.cid,
                    }
                    this.memberNum++;
                },
                onClose: () => {
                    ExtOptions.setValue("UserMarks", this.raw)
                    this.memberNum--
                },
            });
        },
        change: function (e) {
            /**@type {HTMLElement} */
            const target = e.target;
            const infoEle = target.parentElement.parentElement.children[0];
            const uid = infoEle.dataset.key
            document.querySelector("#detailUserTag_uid").value = uid
            document.querySelector("#detailUserTag_tag").value = this.raw[uid].tag
            document.querySelector("#detailUserTag_desc").value = this.raw[uid].desc ?? ""
            document.querySelector("#detailUserTag_refer").value = this.raw[uid].refer ?? ""
            document.querySelector("#detailUserTag_evidence").value = this.raw[uid].evidence ?? ""
            document.querySelector("#detailUserTag_commentId").value = this.raw[uid].commentId ?? ""
        },
        copyEvidence:function(e){
            const target = e.target;
            navigator.clipboard.writeText(target.title);
            mdui.snackbar({
                message:"复制完成",
                position:"right-bottom"
            })
        }
    },
    mounted: async function () {
        this.raw = await ExtOptions.getValue("UserMarks")
        this.memberNum = Object.keys(this.raw).length;
        //addUser
        document.querySelector("#addUserTag").addEventListener("confirm.mdui.dialog", async (e) => {
            /**@type {HTMLElement} */
            const target = e.target;
            const menus = target.children[1]
            const uid = menus.children[0].children[1].value
            const tag = menus.children[1].children[1].value
            const desc = menus.children[2].children[1].value
            let userValid = await acfunApis.users.getUserInfo(uid);
            if (!userValid.result == 0) {
                this.uidError = true;
                this.uidErrorMsg = "或许没办法在这里面的内容找到与UID有关的消息~"
                document.querySelector("#userTag_uid").value = uid
                document.querySelector("#userTag_tag").value = tag
                document.querySelector("#userTag_desc").value = desc

                document.querySelector("#userTag_uid").click();
                document.querySelector("#openAddUserTag").click();
                return
            }
            this.uidError = false
            userAddWrap(this.raw, uid, (userInfo, uid) => {
                const name = userInfo.profile.name;
                this.raw[uid] = {
                    name: name,
                    tag: tag,
                    desc: desc,
                }
                ExtOptions.setValue("UserMarks", this.raw)
            })
        })
        //修改
        document.querySelector("#changeUserTag").addEventListener("confirm.mdui.dialog", async (e) => {
            /**@type {HTMLElement} */
            const target = e.target;
            const menus = target.children[1]
            const uid = menus.children[0].children[1].value
            const name = this.raw[uid].name
            const tag = menus.children[1].children[1].value
            const desc = menus.children[2].children[1].value
            const refer = menus.children[3].children[1].value
            const evidence = menus.children[4].children[1].value
            const commentId = menus.children[5].children[1].value

            delete this.raw[uid]

            this.raw[uid] = {
                name: name,
                tag: tag,
                desc: desc,
                refer: refer,
                evidence: evidence,
                commentId: commentId,
            }
            ExtOptions.setValue("UserMarks", this.raw)
        })
    }
}

export const userTag = app