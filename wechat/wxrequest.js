/**
 * @class 经过封装的微信http请求
 * @description 可以完成的请求包括：post,get,uploadfile
 * @returns 将返回一个promise对象
 * @example 1. send request by request() function 
 *          new WxRequest({
 *              options: {
 *                  method: 'post',
 *                  url: 'http://localhost:3000/get_config',
 *                  data: {field: 'value'}
 *              },
 *              beforeSend: ()=> wx.showLoading(),
 *              afterResponse: ()=> wx.hideLoading()
 *           }).request();
 *           2. send an uploadfile request
 *          new WxRequest({
 *              options: {
 *                  url: 'http://localhost:3000/get_config',
 *                  formdData: {field: 'value'},
 *                  name: 'file'
 *              },
 *              beforeSend: ()=> wx.showLoading(),
 *              afterResponse: ()=> wx.hideLoading()
 *           }).upload();
 *          3. send request by [method]() function , method equals one of ['post', 'get']
 *          new WxRequest({
 *              options: {
 *                  method: 'post',
 *                  url: 'http://localhost:3000/get_config',
 *                  data: {field: 'value'}
 *              },
 *              beforeSend: ()=> wx.showLoading(),
 *              afterResponse: ()=> wx.hideLoading()
 *           }).[method]();
 *          
 */
class WxRequest{
    constructor(config){
        if (!config || !config.options || !config.options.url) {
            throw new Error('请求参数格式有误！');
        }
        this.defaultOptions = Object.assign({
            method: 'GET',
            data: {},
            header: {
                'content-type': 'application/json' // 默认值
            }
        }, config.options);
        this.beforeSend = (config && config.beforeSend) || function(){};
        this.afterResponse = (config && config.afterResponse) || function(){};
    }
    post() {
        this.defaultOptions = Object.assign(this.defaultOptions, {method: 'POST'});
        return this.request();
    }
    get() {
        this.defaultOptions = Object.assign(this.defaultOptions, {method: 'GET'});
        return this.request();
    }
    request() {
        const options = this.defaultOptions, that = this;
        
        this.beforeSend();
        return new Promise((resolve, reject)=> {
            wx.request({
                ...options,
                success: function (res) {
                    that.success(res).then(data => resolve(data)).catch(error=> reject(error));
                },
                fail:  function (res) {
                    that.fail(res).then((data)=> reject(data));
                },
                complete: (res)=> that.complete.bind(this, res)
            });
        });
    }
    upload() {
        const options = Object.assign(this.defaultOptions, {
            header: { "Content-Type": "multipart/form-data" }
        }), that = this;
        this.beforeSend();
        return new Promise((resolve, reject)=> {
            wx.uploadFile({
                ...options,
                success: function (res) {
                    that.success(res).then(data => resolve(JSON.parse(data))).catch(error=> reject(error));
                },
                fail:  function (res) {
                    that.fail(res).then((data)=> reject(data));
                },
                complete: res=> this.complete.bind(this, res)
            });
        });
    }
    success(result) {
        return new Promise((resolve, reject)=> {
            if (result.statusCode === 200) {
                resolve(result.data);
            }else {
                let result_code;
                switch (result.statusCode) {
                    case 0:
                        result_code = 'TIME_OUT';
                        break;
                    case 413:
                        result_code = 'TOO_LARGE';
                        break;
                    case 403:
                    case 400:
                        result_code = 'PROCESS_ERROR';
                        break;
                    case 429:
                        result_code = 'LIMIT_EXCEEDED';
                        break;
                    default:
                        result_code = 'ERROR_UNKOWN';
                        break;
                }
                reject({code: -1, codeText: result_code});
            }
        });
        
    }
    
    fail(result) {
        return new Promise((resolve)=> {
            let result_code = 'ERROR_UNKOWN';
            if (result && result.error) {
                switch (result.error) {
                    case 'uploadFile:fail Error: ESOCKETTIMEDOUT':
                    case 'uploadFile:fail 请求超时。':
                    case 'uploadFile:fail 网络连接已中断。':
                        result_code = 'LIMIT_EXCEEDED';
                        break;                            
                }
            }
            resolve({code: -1, codeText: result_code});
        });
        
    }
    complete(result) {
        this.afterResponse();
    }
}