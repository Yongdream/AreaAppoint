// example/cms/cms_user.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 数据库list
        listCommunity: [],
        listHandler: [],
    
        HandlerComm: '',  // 预约社区（传入参数）

        currentCommMan: '', // 用于存储当前的CommMan
        currentCommTel: '', // 用于存储当前的CommTel

        HandlerDate: '',  // 预约日期
        HandlerTime: '',  // 预约日期
        HandlerUnit: '',  // 预约单位

        visitorTel: '',   // 联系电话
        visitorMan: '',   // 联系人
        visitorNum: null,   // 联系电话
    },
  
      /**
       * 生命周期函数--监听页面加载
       */
      onLoad(options) {
        // 接受传入社区参数
        const HandlerComm = options.a ? options.a : '社区0';
        this.setData({
            HandlerComm: HandlerComm
        });

          wx.cloud.init({
              env:'yang7hi-5geaikfcf337ef0d' // 云开发环境id
          })

          // 全部社区数据
          wx.cloud.database().collection('CommunityInfo')
              .where({
                CommName: HandlerComm
              })    
              .get()
              .then(res => {
                  console.log('请求到指定社区数据',res)
                  this.setData({
                      listCommunity:res.data
                  });
                  if (res.data.length > 0) {
                    this.setData({
                        currentCommMan: res.data[0].CommMan,
                        currentCommTel: res.data[0].CommTel,
                    });
                }
              })
          
          wx.cloud.database().collection('HandlerInfo').get()
              .then(res => {
                    console.log('请求到预约数据',res)
                    this.setData({
                        listHandler:res.data
                    });
                    
                    // 筛选被预约时段
                    const currentComm = this.data.HandlerComm;
                    const filteredHandlers = res.data.filter(item => item.HandlerPass === true && item.HandlerComm === currentComm);
                    const datesAndTimes = filteredHandlers.map(item => ({
                        HandlerDate: item.HandlerDate,
                        HandlerTime: item.HandlerTime
                    }));
                    console.log('已被预约的时间:', datesAndTimes);
                })
      },
      
    //添加原始数据
    submit_origin(){
        wx.cloud.database().collection('CommunityInfo')
        .add({
        data:{
            CommName:'社区0',
            CommMan:'社区联系人0',
            CommTel:'11111406834',
            CommDate:'2023-10-18',
            CommResidue:50
        }
    })
    .then(res => {
        console.log('添加成功',res)
    })
    .catch(res => {
        console.error('添加失败',res)
    })
    },
  
    //添加数据
    submit_add(){
        wx.cloud.database().collection('HandlerInfo')
        .add({
        data:{
            HandlerComm:'社区2',
            HandlerDate:'2023-10-18',
            HandlerUnit:'访客单位00',
            visitorTel:'00000380357'
        }
    })
    .then(res => {
        console.log('添加成功',res)
    })
    .catch(res => {
        console.error('添加失败',res)
    })
    },
  
    // 更新单条数据
    submit_update(){
        wx.cloud.database().collection('order')
            .doc('41d77edc652d534e075ea7295eb96f8e') // 查询单条数据
            .update({
                data:{
                    CommMan:'man',
                    CommName:'小小渔社区',
                }
            })
            .then(res => {
                console.log('更新成功',res)
            })
            .catch(res => {
                console.error('更新失败',res)
            })
    },
  
    // 删除单条数据
    submit_del(){
        wx.cloud.database().collection('order')
            .doc('41d77edc652d534e075ea7295eb96f8e') // 查询单条数据
            .remove({
                data:{
                    CommMan:'man',
                    CommName:'小小渔社区',
                }
            })
            .then(res => {
                console.log('删除成功',res)
            })
            .catch(res => {
                console.error('删除失败',res)
            })
    },
  
    // 更新单条数据v2
    submit_2() {
        wx.cloud.database().collection('order')
            .where({
                CommName: '小渔'  // 查询条件，可以根据实际需要进行调整
            })
            .get()
            .then(res => {
                if (res.data.length > 0) {
                    const docId = res.data[0]._id;  // 获取第一个匹配的文档的ID
    
                    return wx.cloud.database().collection('order')
                        .doc(docId)
                        .update({
                            data: {
                                CommMan: 'man',
                                CommName: '小小渔社区'
                            }
                        });
                } else {
                    console.log('未找到匹配的文档');
                    throw new Error('Document not found');
                }
            })
            .then(updateRes => {
                console.log('更新成功', updateRes);
            })
            .catch(err => {
                console.error('操作失败', err);
            });
    },
  
    handleInput: function(e) {
        const field = e.currentTarget.dataset.field;
        const value = e.detail.value;
    
        console.log('输入字段:', field);
        console.log('输入的值:', value);
        
        let updatedData = {};
        updatedData[field] = value;
        this.setData(updatedData);
    
        if (field === 'HandlerComm') {
            this.setData({ HandlerComm: value });
        } else if (field === 'HandlerDate') {
            this.setData({ HandlerDate: value });
        } else if (field === 'HandlerUnit') {
            this.setData({ HandlerUnit: value });
        } else if (field === 'visitorTel') {
            this.setData({ visitorTel: value });
        } else if (field === 'HandlerTime') {
            this.setData({ HandlerTime: value });
        }else if (field === 'visitorMan') {
            this.setData({ visitorMan: value });
        }else if (field === 'visitorNum') {
            this.setData({ visitorNum: value });
        }

        console.log('更新后的完整listHandler:', this.data.listHandler);
    },
    
    
    submitFunction: function() {
        // 从页面的数据中获取必要的参数
        const { HandlerComm, HandlerDate, HandlerTime, HandlerUnit, visitorMan, visitorTel, visitorNum } = this.data;
    
        // 调用submit函数并传递参数
        this.submit(HandlerComm, HandlerDate, HandlerTime, HandlerUnit, visitorMan, visitorTel, visitorNum);
    },
    

    submit(HandlerComm, HandlerDate, HandlerTime, HandlerUnit, visitorMan, visitorTel, visitorNum) {
        wx.cloud.database().collection('HandlerInfo')
            .add({
            data: {
                HandlerComm: HandlerComm,
                HandlerDate: HandlerDate,
                HandlerTime: HandlerTime,
                HandlerUnit: HandlerUnit,

                visitorMan: visitorMan,
                visitorTel: visitorTel,
                visitorNum: visitorNum,

                HandlerPass: false
            }
        })
        .then(res => {
            console.log('添加成功', res);
        })
        .catch(error => {
            console.error('添加失败', error);
        });
    },
      
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
  
    }
  })