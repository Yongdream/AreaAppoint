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
        HandlerLesson: false, // 是否需要微党课
        HandlerDine: false, // 是否需要就餐
        
        visitorTel: '',   // 联系电话
        visitorMan: '',   // 联系人
        visitorNum: null,   // 联系电话
        filteredHandlers: [],
        timeSlots: {
            "A": "9:00-10:00",
            "B": "10:00-11:00",
            "C": "11:00-12:00",
            "D": "14:00-15:00",
            "E": "16:00-17:00",
            "F": "17:00-18:00"
        },
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
                    
                    // 筛选成功预约时段
                    const filteredHandlers = this.getFilteredHandlers(res.data, this.data.HandlerComm);
                    console.log('已成功预约时段:', filteredHandlers);
                    // 统计每个日期预约数量
                    const countedTimes = this.countHandlerTimes(filteredHandlers);
                    console.log('每个日期下的HandlerTime数量:', countedTimes);

                    // 判断 特定日期 后4个月是否约满
                    const selectedDate = '2023-10-18';      // 示例
                    const fullyBookedDates = this.checkDatesFullyBooked(countedTimes, selectedDate);
                    console.log('从', selectedDate, '开始的后4个月中约满的日期:', fullyBookedDates);

                    const availableSlots = this.getAvailableTimeSlotsForGivenDate(filteredHandlers, selectedDate);
                    console.log('在', selectedDate, '的剩余时间段编号为:', availableSlots); // 输出剩余的时间段编码
                });
    },

    // 当前社区全部预约信息
    getFilteredHandlers: function(data, currentComm) {
        return data.filter(item => item.HandlerPass === true && item.HandlerComm === currentComm);
    },

    // 统计每个日期被预约次数
    countHandlerTimes: function(datesAndTimes) {
        let result = {};

        for (let item of datesAndTimes) {
            if (result[item.HandlerDate]) {
                result[item.HandlerDate] += 1;
            } else {
                result[item.HandlerDate] = 1;
            }
        }
        return result;
    },

    // 判断日期起始日期后4个月是否约满 输出约满的日期
    checkDatesFullyBooked: function(countedTimes, startDate) {
        let date = startDate;
        const fullyBookedDates = [];
        const endDate = this.getNextDateAfterFourMonths(startDate);  // 计算4个月后的日期

        while (date !== endDate) {
            if (countedTimes[date] && countedTimes[date] >= 6) {
                fullyBookedDates.push(date);
            }
            date = this.getNextDate(date);  // 将日期加一天
        }

        return fullyBookedDates;
    },


    // 日期后一天
    getNextDate: function(dateStr) {
        const dt = new Date(dateStr);
        dt.setDate(dt.getDate() + 1);
        const newday = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2);
        return newday;
    },


    // 日期后4个月
    getNextDateAfterFourMonths: function(dateStr) {
        const dt = new Date(dateStr);
        dt.setMonth(dt.getMonth() + 4);
        const newDate = dt.getFullYear() + "-" + ("0" + (dt.getMonth() + 1)).slice(-2) + "-" + ("0" + dt.getDate()).slice(-2);
        console.log("New date after 4 months:", newDate);
        return newDate;
    },


    // 获取指定日期的剩余时间段编码
    getAvailableTimeSlotsForGivenDate: function(filteredHandlers, date) {
        const allSlots = this.data.timeSlots;
        const bookedSlotsForDate = filteredHandlers
            .filter(item => item.HandlerDate === date)
            .map(item => item.HandlerTime);

        // console.log('bookedSlotsForDate:', bookedSlotsForDate);
        const availableSlotKeys = Object.keys(allSlots).filter(slotKey => !bookedSlotsForDate.includes(allSlots[slotKey]));
        return availableSlotKeys; 
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

    handleCheckboxChange: function(e) {
        const field = e.currentTarget.dataset.field;
        // 直接取当前状态的反来判断复选框是否被选中
        const isChecked = !this.data[field];
        console.log('isChecked:', isChecked);
    
        let updatedData = {};
        updatedData[field] = isChecked;
        this.setData(updatedData);
        console.log('updatedData:', updatedData);
    },
    
    
    submitFunction: function() {
        // 如果用户选择了文件，首先上传文件
        if (this.data.selectedFilePath) {
            const filePath = this.data.selectedFilePath;
            const cloudPath = 'HandlerFile/' + new Date().getTime() + filePath.match(/\.([^.]+)$/)[1];
            
            wx.cloud.uploadFile({
                cloudPath: cloudPath,
                filePath: filePath,
                success: res => {
                    console.log('文件上传成功:', res.fileID);
                    this.setData({
                        selectedFileID: res.fileID
                    });
                    this.submitFormData();
                },
                fail: e => {
                    console.error('文件上传失败:', e);
                }
            })
        } else {
            // 如果用户没有选择文件，直接提交表单
            this.submitFormData();
        }
    },

    submitFormData: function() {
        // 从页面的数据中获取必要的参数
        const { HandlerComm, HandlerDate, HandlerTime, HandlerUnit, HandlerLesson, HandlerDine, visitorMan, visitorTel, visitorNum, selectedFileID  } = this.data;
    
        // 调用submit函数并传递参数
        this.submit(HandlerComm, HandlerDate, HandlerTime, HandlerUnit, HandlerLesson, HandlerDine, visitorMan, visitorTel, visitorNum, selectedFileID);
    },

    // 提交表单
    submit(HandlerComm, HandlerDate, HandlerTime, HandlerUnit, HandlerLesson, HandlerDine, visitorMan, visitorTel, visitorNum, fileID) {
        const data = {
            HandlerComm: HandlerComm,
            HandlerDate: HandlerDate,
            HandlerTime: HandlerTime,
            HandlerUnit: HandlerUnit,
            HandlerLesson: HandlerLesson,
            HandlerDine: HandlerDine,

            visitorMan: visitorMan,
            visitorTel: visitorTel,
            visitorNum: visitorNum,
            HandlerPass: false
        };
        if (fileID) data.HandlerFileID = fileID;

        wx.cloud.database().collection('HandlerInfo').add({ data })
        .then(res => {
            console.log('添加成功', res);
        })
        .catch(error => {
            console.error('添加失败', error);
        });
    },

    previewImage: function() {
        wx.previewImage({
            urls: ['cloud://yang7hi-5geaikfcf337ef0d.7961-yang7hi-5geaikfcf337ef0d-1309139202/cloudbase-cms/upload/2023-10-21/6cc92ddxvo6r7v82o0rqbn812k3yv7e0_.png']
        });
    },

    chooseFile: function () {
        const that = this
        wx.showActionSheet({
          itemList: ['拍照', '相册'],
          itemColor: '',
          //成功时回调
          success: function (res) {
            if (!res.cancel) {
              /*
               res.tapIndex返回用户点击的按钮序号，从上到下的顺序，从0开始
               比如用户点击本例中的拍照就返回0，相册就返回1
               我们res.tapIndex的值传给chooseImage()
              */
              that.chooseImage(res.tapIndex)
            }
          },
          //失败时回调
          fail: function (res) {
            console.log('调用失败')
           },
          complete: function (res) { },
        })
      },

      chooseImage(tapIndex) {
        const checkeddata = true
        const that = this
        wx.chooseImage({
        //count表示一次可以选择多少照片
          count: 1,
          //sizeType所选的图片的尺寸，original原图，compressed压缩图
          sizeType: ['original', 'compressed'],
          //如果sourceType为camera则调用摄像头，为album时调用相册
          sourceType: [that.data.sourceType[tapIndex]],
          success(res) {
            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths
            //将选择到的图片缓存到本地storage中
            wx.setStorageSync('tempFilePaths', tempFilePaths)
            that.setHeader();
            wx.showToast({
              title: '设置成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      },
    
      
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
  
    }
  });



