// 上传文件大小限制
const MAX_UPLOAD_VIDEO_FILE_SIZE = 20 * 1024 * 1024; //单位是B
// 录制视频长度限制
const MAX_VIDEO_DURATION = 60; //上限，单位为s(秒)
const MIN_VIDEO_DURATION = 0; //下限

export function chooseImage(params) {
    return new Promise((resolve, reject)=> {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有,['album', 'camera']
            success: function (res) {
                // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                let  tempFilePaths = res.tempFilePaths
                let filePath = tempFilePaths && tempFilePaths[0];
                resolve(filePath);
            },
            fail: ()=> {
            }
        });
    });
}
export function chooseVideo(params) {
    function validateVideo(res) {
        let checkSize = params && params.checkSize || false;
        let checkDuration = params && params.checkDuration || false;
    
        if (checkSize) {
            if (res.duration < MIN_VIDEO_DURATION || res.duration > MAX_VIDEO_DURATION) {
                return [{codeText: 'INVALID_VIDEO_DURATION'}];
            }
        }
        if (checkDuration) {
            if (res.size > MAX_UPLOAD_VIDEO_FILE_SIZE) {
                return [{codeText: 'VIDEO_FILE_TOO_LARGE'}];
            }
        }
        return [];
    }
    return new Promise((resolve, reject)=> {
        wx.chooseVideo({
            sourceType: params && params.sourceType || ['camera'],
            maxDuration: params && params.maxDuration || MAX_VIDEO_DURATION,
            camera: 'front',
            compressed: true,
            success: function (res) {
                // console.log(res);
                let validateError = validateVideo(res);
                if (validateError.length <= 0) {
                    resolve(res.tempFilePath);
                }else {
                    reject(validateError[0]);
                }
                
            },
            fail: ()=> {
                
            }
        });
    });
}
