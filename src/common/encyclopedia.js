const videoQualitiesRefer =
{
    "2160p120": { "limitType": 1, "qualityType": "2160p120", "qualityLabel": "2160P120", "definition": "4K", "width": 3840, "height": 2160 },
    "2160p60": { "limitType": 1, "qualityType": "2160p60", "qualityLabel": "2160P60", "definition": "4K", "width": 3840, "height": 2160 },
    "2160p": { "limitType": 1, "qualityType": "2160p", "qualityLabel": "2160P", "definition": "4K", "width": 3840, "height": 2160 },
    "1080p60": { "limitType": 1, "qualityType": "1080p60", "qualityLabel": "1080P60", "definition": "HD", "width": 1920, "height": 1080 },
    "720p60": { "limitType": 1, "qualityType": "720p60", "qualityLabel": "720P60", "width": 1280, "height": 720 },
    "1080p+": { "limitType": 1, "qualityType": "1080p+", "qualityLabel": "1080P+", "definition": "HD", "width": 1920, "height": 1080 },
    "1080p": { "limitType": 1, "qualityType": "1080p", "qualityLabel": "1080P", "definition": "HD", "width": 1920, "height": 1080 },
    "720p": { "qualityType": "720p", "qualityLabel": "720P", "width": 1280, "height": 720 },
    "540p": { "qualityType": "540p", "qualityLabel": "540P", "width": 960, "height": 540 },
    "480p": { "qualityType": "480p", "qualityLabel": "480P", "width": 720, "height": 480 },
    "360p": { "qualityType": "360p", "qualityLabel": "360P", "width": 640, "height": 360 }
}

/**
 * 每一千秒所播放的帧数
 * @refer @伯翎飞云[2021年4月8日21:31:47]："电影23.976;60帧如果是NTSC的话是59.94;感知不强方向错了"
 */
const standardFrameRate = {
    "24": 23976,
    "25": 25000,
    "30": 29970,
    "60": 59940,
    "120": 120000
}

const acfunApis = {
    liveInfo: `https://live.acfun.cn/api/live/info?authorId=`,
    /**
     * @Example:?sourceId=30637780&sourceType=3&page=1&pivotCommentId=0&newPivotCommentId=&t=1628913287304&supportZtEmot=true 
     * sourceId ->acid
     */
    comment: `https://www.acfun.cn/rest/pc-direct/comment/list`,
    /**
     * @example ?sourceId=30637780&sourceType=3&page=1&pivotCommentId=0&newPivotCommentId=0&t=1628913415510&supportZtEmot=true
     */
    floorComment: `https://www.acfun.cn/rest/pc-direct/comment/listByFloor`,
    /**
     * @method POST 
     * @example kpn=ACFUN_APP&kpf=PC_WEB&subBiz=mainApp&interactType=1&objectType=2&objectId=30637780&acfun.midground.api_st=xxxxxxx&extParams%5BisPlaying%5D=false&extParams%5BshowCount%5D=3&extParams%5BotherBtnClickedCount%5D=20&extParams%5BplayBtnClickedCount%5D=0
     */
    like: `https://kuaishouzt.com/rest/zt/interact/add`,
    unlike: `https://kuaishouzt.com/rest/zt/interact/delete`,
    extensionIconImg: `https://i.loli.net/2020/05/28/2k8dPLiGEZNHjny.png`,
    liveReward: `https://m.acfun.cn/rest/apph5-direct/pay/reward/giveRecords?pcursor=`,
    personalBasicInfo: `https://www.acfun.cn/rest/pc-direct/user/personalBasicInfo`,

}