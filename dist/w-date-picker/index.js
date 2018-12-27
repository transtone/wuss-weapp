import Behavior from '../common/behavior/index';
import field from '../common/behavior/field';

Component({
  /**
   * 继承父组件的class
   */
  externalClasses: ['wuss-class'], 
  
  /**
   * 组件间关系定义
   */
  relations: {
    '../w-form/index': {
      type: 'ancestor',
    },
    '../w-validate/index': {
      type: 'ancestor',
    },
  },
   
  /**
   * 组件选项
   */
  options: {
    addGlobalClass: true,
  },
   
  /**
   * 组件间关系定义
   */
  behaviors: [Behavior,field],
   
  /**
   * 组件的属性列表
   * @param {string} mode 日期选择的类型, 可以是日期date,时间time,日期+时间datetime,年year,月month
   * @param {date} value 当前选中时间
   * @param {string} label  左侧标题
   * @param {string} title popup弹出层标题
   * @param {date} defaultValue 默认值
   * @param {date} minDate 最小可选日期
   * @param {date} maxDate 最大可选日期
   * @param {boolean} disabled 是否禁用
   */
  properties: {
    mode: {
      type: String,
      value: 'date',
    },
    label: {
      type: String,
    },
    title: {
      type: String,
    },
    defaultValue: {
      type: null,
      value: new Date().getTime(),
    },
    currentValue: {
      type: null,
      // observer(__v) {
      //   __v && this._setCurrentValue(__v);
      // },
    },
    value: {
      type: null,
      observer(__v) {
        __v && this._setCurrentValue(__v);
      },
    },
    minDate: {
      type: null,
      value: '1980',
    },
    maxDate: {
      type: null,
      value: '2018',
    },
    disabled: {
      type: Boolean,
    },
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    options: null,
    _currentValue: [],
  },
  
  /**
   * 组件方法列表
   */
  methods: {
    initDatePicker() {
      const { mode, defaultValue, value } = this.data;
      // switch (mode.toLowerCase()) {
      //   case 'date': // 日期date YYYY-MM-DD
      //   case 'time': // 时间time HH-MM
      //   case 'datetime': // 日期+时间datetime YYYY-mm-dd--hh--mm--dd
      //   case 'month': // 月month MM
      //   default:
      //     throw Error('mode格式选择有误！请查看wuss-weapp文档使用！');
      //     break;
      // };
      const defaultValueType = Object.prototype.toString.call(defaultValue);
      let _currentValue;
      if(defaultValueType === '[object Array]') {
        _currentValue = defaultValue;
      } else {
        let date = new Date(defaultValue);
        const _month = String((date.getMonth()+1) < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1);
        const _day = String(date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());
        _currentValue = [
          date.getFullYear(),
          _month,
          _day,
        ];
      };
      this.setData({
        _currentValue,
      }, () => {
        this._renderDate();
        this._setCurrentValue(_currentValue);
      })
    },
    _renderDate() {
      const { minDate, maxDate, _currentValue } = this.data;
      const dateOptions = [ [] ,[], [] ];
      const _renderMaxDateTotal = Math.abs(new Date(maxDate).getFullYear() - new Date(minDate).getFullYear());
      for (let yearIndex = -1; yearIndex < _renderMaxDateTotal; yearIndex++) {
        const date = new Date(minDate);
        date.setFullYear(date.getFullYear() + yearIndex+1);
        dateOptions[0].push({
          key: `${date.getFullYear()}年`,
          value: String(date.getFullYear()),
        });
      };
      this.setData({
        options: dateOptions,
      });
      this._renderMonth(_currentValue[0]);
      console.log(dateOptions)
    },
    /**
     * 获取当月的总天数
     */
    getCurrentTotalDays(year,month) {
      return new Date(year,month,0).getDate();
    },
    _setCurrentValue(value) {
      const { options } = this.data;
      const defaultValueType = Object.prototype.toString.call(value);
      let _currentValue;
      if(defaultValueType === '[object Array]') {
        _currentValue = value;
      } else {
        let date = new Date(value);
        const _month = String((date.getMonth()+1) < 10 ? `0${date.getMonth()+1}` : date.getMonth()+1);
        const _day = String(date.getDate() < 10 ? `0${date.getDate()}` : date.getDate());
        _currentValue = [
          date.getFullYear(),
          _month,
          _day,
        ];
      }
      const { [0]: year, [1]: month, [2]: day } = _currentValue;
      const currentValue = [[],[],[]];
      currentValue[0] = options[0].findIndex(_v => (String(_v.value) === String(year)));
      currentValue[1] = options[1].findIndex(_v => (String(_v.value) === String(month)));
      currentValue[2] = options[2].findIndex(_v => (String(_v.value) === String(day)));
      this.setData({
        currentValue,
        _currentValue,
      })
    },
    _renderMonth(year,_month) {
      const { _currentValue }= this.data;
      const monthOptions = [];
      for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
        const month = String(monthIndex < 10 ? `0${monthIndex}` : monthIndex);
        monthOptions.push({
          key: `${month}月`,
          value: `${month}`,
          parent: String(year),
        });
      };
      this.setData({
        [`options[1]`]: monthOptions,
      });
      this._renderDays(year,_month ? _month : _currentValue[1])
    },
    _renderDays(year,month) {
      const days = [];
      const days_count = this.getCurrentTotalDays(year,month);
      for (let daysIndex = 1; daysIndex <= days_count; daysIndex++) {
        const day = String(daysIndex < 10 ? `0${daysIndex}` : daysIndex);
        days.push({
          key: `${day}日`,
          value: String(day),
          parent: `${month}`,
        });  
      };
      this.setData({
        [`options[2]`]: days,
      });
      console.log(days,this.data.options);
    },
    handleOnChange(e) {
      const { [0]: yearIndex, [1]: monthIndex, [2]: dayIndex } = e.detail.value;
      const { [0]: year, [1]: month } = this.data.options;
      const currentYear = year[yearIndex].value;
      const currentMonth = (month[monthIndex].value);
      this._renderMonth(currentYear,currentMonth);
    },
    handleSelect(e) {
      const { [0]: year, [1]: month, [2]: day } = e.detail.value;
      try {
        const value = `${year}-${month}-${day}`;
        console.log(value);
        this.triggerEvent('onSelect',{ value },{});
      } catch (error) {}
    },
  },
  
  /**
   * 在组件实例进入页面节点树时执行
   */
  created: function () {},
   
  /**
   * 组件布局完成后执行
   */
  ready: function () {
    this.initDatePicker();
  },
  
  /**
   * 在组件实例进入页面节点树时执行
   */
  attached: function () {},
   
  /**
   * 在组件实例被移动到节点树另一个位置时执行
   */
  moved: function () {},
   
})