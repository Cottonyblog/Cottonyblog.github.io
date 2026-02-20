// database.js
// 支持双语内容：后缀 _en 代表英文，无后缀代表默认(中文)

const calDatabase = {
    "1944-06-06": {
        // 中文内容
        dateTitle: "1944年6月6日 (D-Day)",
        frontline: [
            "霸王行动开始。盟军在诺曼底海滩登陆。",
            "美军第1和第29师在奥马哈海滩遭受毁灭性伤亡。"
        ],
        microHistory: "<strong>微观生存志：最漫长的一天</strong><br>这一天之所以漫长，是因为在那24小时里，无数个不确定性被强行压缩。在奥马哈海滩，时间仿佛冻结；而在大洋彼岸的布鲁克林，像乔伊母亲海伦这样的普通人，守在收音机旁，祈祷着杠杆的另一端能撬起胜利。",
        
        // 英文内容 (English Content)
        dateTitle_en: "6 June 1944 (D-Day)",
        frontline_en: [
            "Operation Overlord begins. Allied forces land on Normandy.",
            "US 1st & 29th Divisions suffer devastating casualties at Omaha Beach."
        ],
        microHistory_en: "<strong>Micro-History: The Longest Day</strong><br>It was long because thousands of uncertainties were compressed into 24 hours. While time froze at Omaha Beach, Helen in Brooklyn sat by the radio, praying that the lever would tip towards victory.",

        // 媒体内容 (通用)
        media: [
            {
                type: "image",
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Into_the_Jaws_of_Death_23-0453M_edit.jpg/800px-Into_the_Jaws_of_Death_23-0453M_edit.jpg",
                caption: "奥马哈海滩：迎向死亡之颚",
                caption_en: "Omaha Beach: Into the Jaws of Death"
            }
        ]
    },
    "1944-08-25": {
        dateTitle: "1944年8月25日 (巴黎解放)",
        frontline: ["法军第二装甲师进入巴黎。", "德军指挥官肖尔铁茨投降。"],
        microHistory: "<strong>微观生存志：</strong>巴黎没有被烧毁，但平民的胃依然是空的。胜利终结了纳粹的统治，但尚未终结生活的裂痕。",
        
        dateTitle_en: "25 August 1944 (Liberation of Paris)",
        frontline_en: ["French 2nd Armored Division enters Paris.", "German garrison commander surrenders."],
        microHistory_en: "<strong>Micro-History:</strong> Paris was not renewed, but stomachs remained empty. Victory ended Nazi rule, but not the cracks in daily life.",
        
        media: [
            {
                type: "image",
                src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Crowds_of_French_patriots_line_the_Champs_Elysees_to_view_Free_French_tanks_and_half_tracks_of_General_Leclerc%27s_2nd..._-_NARA_-_531235.jpg/800px-Crowds_of_French_patriots_line_the_Champs_Elysees_to_view_Free_French_tanks_and_half_tracks_of_General_Leclerc%27s_2nd..._-_NARA_-_531235.jpg",
                caption: "香榭丽舍大道的解放游行",
                caption_en: "Liberation parade on Champs-Élysées"
            }
        ]
    }
};