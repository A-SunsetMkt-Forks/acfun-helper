class AcFunHelperBackendCore extends AcFunHelperBackend {
    constructor() {
        super();
        globalThis.runtimeData = this.runtimeData;
        /**@type {runtimeData} */
        this.runtime = globalThis.runtimeData;
        /**浏览器类型数据 */
        this.runtime.dataset.core.browserType = ToolBox.thisBrowser();

        this.options = null;

        this.initBackend().then(init => {
            if (!init) {
                return;
            }
            /**开发模式 */
            // this.devReload = new AcFunHelper(1); this.devReload.devModeWatch();

            chrome.runtime.onInstalled.addListener(this.onInstalled.bind(this));

            /**消息&调用处理 */
            this.MessageRouter = new MessageSwitch("bg");

            chrome.runtime.onMessage.addListener(this.MessageRouter.BackgroundMessageSwitch.bind(this));
            this.sandboxAgent = new SandboxAgent(document.getElementById('sandbox').contentWindow);
            window.addEventListener('message', this.MessageRouter.SandboxMsgHandler.bind(this));
            this.runtime.dataset.core.status.messageSwitch = true;

            /**通知响应 */
            chrome.notifications.onButtonClicked.addListener((e, index) => this.notifBuTrigger(e, index));
            this.runtime.dataset.core.status.notificationButtunTrigger = true;

            /**计划任务处理 */
            chrome.alarms.onAlarm.addListener((e) => this.onAlarmsEvent(e));
            this.runtime.dataset.core.status.scheduler = true;

            /**模块实例化 */
            this.MsgNotifsInst = new MsgNotifs();
            this.contextMenuMgmt = new ContextMenuManage();
            this.WatchPlan = new WatchPlan();
            this.authInfo = new AuthInfo();
            this.Ominibox = new Ohminibox();
            this.Upgrade = new UpgradeAgent();

            /**就绪 */
            this.runtime.dataset.core.status.core = true;
            this.startDaemon();
        })
    }

    startDaemon() {
        if (this.options.enabled) {
            /**建立计划任务表 */
            for (let task in this.runtime.dataset.core.scheduler) {
                if (typeof (task) == "string") {
                    chrome.alarms.create(task, this.runtime.dataset.core.scheduler[task].option)
                }
            }
            /**右键菜单实体、事件挂接 */
            this.contextMenuMgmt.attachAll();
            /**评论事件钩子 */
            //评论区
            chrome.webRequest.onBeforeRequest.addListener(
                this.onCommentRequest.bind(this),
                {
                    urls: ["https://www.acfun.cn/rest/pc-direct/comment/*"]
                },
                []
            );
            //直播流
            chrome.webRequest.onBeforeRequest.addListener(
                this.onLiveStreamUrl.bind(this),
                {
                    urls: ["*://*/livecloud*"]
                },
                []
            );
        }

    }

    /**
     * 通知按钮点击响应处理
     * @param {string} e 
     * @param {number} index 
     * @returns 
     */
    notifBuTrigger(e, index) {
        for (let regElem in this.runtime.dataset.notificationBtnTriggerData) {
            if (new RegExp(regElem).test(e)) {
                this.runtime.dataset.notificationBtnTriggerData[regElem](e, index);
            }
        }
    }

    /**
     * 计划任务处理
     * @param {chrome.alarms.Alarm} e 
     */
    onAlarmsEvent(e) {
        const targetTaskGroup = this.runtime.dataset.core.scheduler[e.name];
        for (let taskgroup in targetTaskGroup.tasks) {
            for (let task in targetTaskGroup.tasks[taskgroup]) {
                targetTaskGroup.tasks[taskgroup][task]();
            }
        }
    }

    onInstalled(details) {
        const versionNum = chrome.runtime.getManifest().version;
        initializeDBTable();
        if (details.reason === 'install') {
            chrome.tabs.create({ url: chrome.runtime.getURL('bg/firstRun.html') });
        }
        if (details.reason === 'update') {
            if (versionNum == details.previousVersion) {
                chrome.notifications.create(null, {
                    type: 'basic',
                    iconUrl: 'images/notice.png',
                    title: 'AcFun助手',
                    message: '重启了！'
                });
                return;
            }
            chrome.notifications.create(null, {
                type: 'basic',
                iconUrl: 'images/notice.png',
                title: 'AcFun助手',
                message: '更新了！'
            });
            this.onUpdated();
        }
    }

    async onUpdated() {
        let rawOpts = await optionsLoad();
        //更改用户标记、文章区用户内容屏蔽数据的结构
        if (rawOpts.UserMarks == null && rawOpts.UserFilter == null) {
            let rawOptsKey = Object.keys(rawOpts);
            let markExp = new RegExp("^AC_(.*)");
            let filterExp = new RegExp("^FILTER_(.*)");
            let UserMarks = {};
            let UserFilter = {};
            for (let i = 0; i < rawOptsKey.length; i++) {
                if (markExp.test(rawOptsKey[i])) {
                    UserMarks[markExp.exec(rawOptsKey[i])[1]] = rawOpts[markExp.exec(rawOptsKey[i])[0]];
                    delete rawOpts[markExp.exec(rawOptsKey[i])[0]]
                } else if (filterExp.test(rawOptsKey[i])) {
                    UserFilter[filterExp.exec(rawOptsKey[i])[1]] = rawOpts[filterExp.exec(rawOptsKey[i])[0]];
                    delete rawOpts[filterExp.exec(rawOptsKey[i])[0]]
                }
            }
            let x = Object.keys(rawOpts);
            let y = new RegExp("AC_.*");
            x.forEach((e) => {
                if (y.test(e)) {
                    chrome.storage.local.remove(e, function () { });
                }
            })
            chrome.storage.local.set({ "UserMarks": UserMarks }, function () { })
            chrome.storage.local.set({ "UserFilter": UserFilter }, function () { })
        }
        //关闭文章区用户内容评论
        if (rawOpts['filter']) {
            chrome.storage.local.set({ "filter": false }, function () { });
        }
        //关闭用户动态渲染（2021-7-5失效：接口改动）
        if (rawOpts['userHomeMoment']) {
            chrome.storage.local.set({ "userHomeMoment": false }, function () { });
        }
        if (rawOpts['uddPopUp']) {
            chrome.storage.local.set({ "uddPopUp": false }, function () { });
        }
    }

    onCommentRequest(req) {
        let url = req.url;
        let tabId = req.tabId;
        let commentListReg = new RegExp("https://www.acfun.cn/rest/pc-direct/comment/list\\?.*");
        let commentSubReg = new RegExp("https://www.acfun.cn/rest/pc-direct/comment/sublist\\?.*rootCommentId=(\\d+).*");

        if (commentListReg.test(url)) {
            this.tabInvoke(tabId, 'renderList', { url: url });
        } else if (commentSubReg.test(url)) {
            let rootCommentId = url.match(commentSubReg)[1];
            this.tabInvoke(tabId, 'renderSub', { rootCommentId: rootCommentId, url: url });
        }
        this.authInfo.fetchPasstoken();
    }

    onLiveStreamUrl(req) {
        this.authInfo.fetchPasstoken();
        const liveReg = new RegExp("http(s)?://.*-acfun-adaptive.pull.etoote.com/livecloud/.*");
        const url = req.url;
        const tabId = req.tabId;
        if (liveReg.test(url)) {
            this.tabInvoke(tabId, 'renderLive', { url: url });
        }
    }

    tabInvoke(tabId, action, params) {
        MessageSwitch.sendMessage('bg', { target: action, InvkSetting: { tabId: tabId, type: "function" }, params: params },)
    }

    async initBackend() {
        let options = await ExtOptions.getAll();
        return this.opt_optionsChanged(options);
    }

    async opt_optionsChanged(options) {
        if (!options.permission) {
            return false;
        }
        this.options = options;
        optionsSave(this.options);
        return true;
    }

    async opt_optionUpdate(options) {
        this.options = options;
    }

    async loadScripts(list) {
        let promises = list.map((name) => this.loadScript(name));
        let results = await Promise.all(promises);
        return results.filter(x => {
            if (x.result) return x.result;
        });
    }

    async loadScript(name) {
        return new Promise((resolve, reject) => {
            this.agent.postMessage('loadScript', { name }, result => resolve(result));
        });
    }

    async setScriptsOptions(options) {
        return new Promise((resolve, reject) => {
            this.agent.postMessage('setScriptsOptions', { options }, result => resolve(result));
        });
    }

    static async removeTask(taskGroupName) {
        return new Promise((resolve, reject) => {
            /**@type {runtimeData} */
            const runtime = globalThis.AcFunHelperBackendCore.runtime;
            if (taskGroupName in runtime.dataset.core.scheduler) {
                chrome.alarms.clear(taskGroupName, (status) => {
                    if (status) {
                        delete runtime.dataset.core.scheduler[taskGroupName];
                        resolve();
                    }
                })
            }
        })
    }

    api_notice(params) {
        let { title, msg } = params;
        notice(title, msg);
    }

    async api_watchLater() {
        this.WatchPlan.execWatch();
    }

    async api_stopWatchLater() {
        this.WatchPlan.exitWatchPlan();
    }

    async api_syncWatchLaterList() {
        return this.WatchPlan.syncAppWatchLater();
    }

    async api_removeDiffWatchLaterList() {
        this.WatchPlan.removeAllDiffWatchLaterListItemFromLocal();
    }

    api_getLiveWatchTimeList() {
        return this.WatchPlan.getLiveWatchTimeList();
    }

    api_livePageWatchTimeRec(params) {
        this.WatchPlan.livePageWatchTimeRec(params);
    }

    api_attentionTabs(params) {
        return this.WatchPlan.attentionTabs(params.windowId);
    }

    api_updateLiveWatchTimeListItem() {
        return this.WatchPlan.updateLiveWatchTimeList();
    }

    api_bananAudio() {
        this.MsgNotfs.bananAudio();
    }

    async api_achievementEvent(e) {
        if (e.action == "get") {
            return await db_getHistoricalAchievs(REG.acVid.exec(e.url)[2]);
        } else if (e.action == "put") {
            db_insertHistoricalAchievs(REG.acVid.exec(e.url)[2], e.tagData);
            return true;
        }
    }

    api_sandboxReady() {
        this.runtime.dataset.core.status.sandbox = true;
    }

    async api_Fetch(params) {
        let { url, callbackId } = params;
        let request = {
            url,
            type: 'GET',
            dataType: 'text',
            timeout: 3000,
            error: (xhr, status, error) => this.callback(null, callbackId),
            success: (data, status) => this.callback(data, callbackId)
        };
        $.ajax(request);
    }

    async api_BkFetch(params) {
        let { url, method, data, withCredentials, callback } = params;
        return await fetchResult(url, method, data, withCredentials);
    }

}

window.AcFunHelperBackendInst = new AcFunHelperBackendCore();