;(function(window,documnent){
	'use strict';
	var pluginName = 'swiperLeft';
	var CSS_PREFIX_MAP;
	CSS_PREFIX_MAP = ["webkit", "moz", "ms", "o", ""];
	var EVENT;
	if('ontouchstart' in window){
		EVENT = {
			START:'touchstart',
			MOVE:'touchmove',
			END:'touchend'
		}
	}else{
		EVENT = {
			START:'mousedown',
			MOVE:'mousemove',
			END:'mouseup'
		}
	}

	var noop = function() {};
	/**
	 *@description 设置ele的translate偏移量
	 * @param ele
	 * @param x
	 * @param y
	 * @param z
	 * @returns {Array}
	 */
	function setTranslate(ele, x, y, z) {
		var name, prefix, _i, _len, _results;
		_results = [];
		for (_i = 0, _len = CSS_PREFIX_MAP.length; _i < _len; _i++) {
			prefix = CSS_PREFIX_MAP[_i];
			name = prefix ? "" + prefix + "Transform" : "transform";
			_results.push(ele.style[name] = "translate3d(" + (x || 0) + "px, " + (y || 0) + "px, " + (z || 0) + "px)");
		}
		return _results;
	}

	var swiperLeft = function(ele,option){
		this.default = {
			isLock : false,
		}
		this.onStart = this.onMove = this.onEnd = noop;
		this.allowSwipeout = true, // 允许滑动，作用于滑动收起时，防止重复触发
		this.touchesStart = {}, // 开始坐标
		this.touchStartTime, // 开始触发时间
		this.touchesDiff, // 移动距离
		this.translate, // 偏移距离
		this.lastTranslate, // 偏移距离
		this.isTouch, // 标识触发点击
		this.isMove, // 标识是否在移动
		this.operEleWidth;//可移动的界限值
		this.operEle,
	    this.parentEle,
		this.option = {};
		this.translateTime = 20,
		this.translateDis = 2,
	    this.timer,
		this.extend(this.option,option);
		this.init(ele);
	}
	swiperLeft.prototype = {
		init:function(ele){
			this.isMove = false;
			this.isMove = false;
			this.parentEle = ele;
			this.operEle = this.parentEle.querySelectorAll('.item-action')[0];
			this.operEleWidth = this.operEle.clientWidth;
			this.translate = 0;
			this.lastTranslate = 0;

			ele.addEventListener(EVENT.START, this.onTouchStart.bind(this), false);
			ele.addEventListener(EVENT.MOVE, this.onTouchMove.bind(this), false);
			ele.addEventListener(EVENT.END, this.onTouchEnd.bind(this), false);

		},
		extend:function(opt,option){
			for(var key in option){
				opt[key] = option[key];
			}
			return opt;
		},
		start:function(fn){

			return (this.onStart = fn) && this;
		},
		move:function(fn){
			return (this.onMove = fn) && this;
		},
		end:function(fn){
			return (this.onEed = fn) && this;
		},
		onTouchStart:function(event){
			this.onSliderStart(event);
			return this.onStart.apply(this, [event]);
		},
		onSliderStart:function(event){
			if(this.option.isLock){
				return;
			}
			if(!this.allowSwipeout){
				return;
			}
			if(this.isMove){
				return;
			}
			if(this.option.isLock){
				return;
			}
			if(event.target.parentNode.className == 'item-action'){
				event.preventDefault();
				return;
			}
			this.isTouch = true;
			this.lastTranslate = 0;
			this.touchesStart.x = event.type === 'touchstart'?event.touches[0].pageX:event.pageX;
			this.touchesStart.y = event.type === 'touchstart'?event.touches[0].pageY:event.pageY;
			this.touchStartTime = Date.now();
		},
		onTouchMove:function(event){
			this.onSliderMove(event);
			return this.onMove.apply(this, [event]);
		},
		onSliderMove:function(event){
			if(!this.isTouch){
				return;
			}
			var pageX = event.type === 'touchmove' ? event.touches[0].pageX : event.pageX,
			  pageY = event.type === 'touchmove' ? event.touches[0].pageY : event.pageY;

			// 取点判断方向
			if (Math.abs(pageX - this.touchesStart.x) == 0) {
				return;
			}
			this.isMove = true;
			event.preventDefault();
			this.touchesDiff = pageX - this.touchesStart.x;
			var _absMoveX = Math.abs(this.touchesDiff);

			if(_absMoveX < this.operEleWidth && this.touchesDiff<0){
				this.translate = this.touchesDiff;
			}else if(_absMoveX >= this.operEleWidth && this.touchesDiff<0){
				this.translate = -this.operEleWidth;
			}else if(this.touchesDiff>0 && (this.translate + _absMoveX)< 0 ){
				this.translate = this.translate + _absMoveX;
			}else{
				this.translate = 0;
			}
			setTranslate(this.parentEle,this.translate,0,0);
		},
		onTouchEnd:function(event){
			this.onSliderEnd(event);
			return this.onEnd.apply(this, [event]);
		},
		onSliderEnd:function(event){
			this.isTouch = false;
			this.isMove = false;

			var timeDiff = (new Date()).getTime() - this.touchesStartTime;

			// 处理点击
			if (timeDiff < 200 && this.touchesDiff === 0) {
				return;
			}

			// 处理开启或关闭
			if (Math.abs(this.translate) > this.operEleWidth / 2){
				this.swiperOpen();
			}else{
				this.swiperClose();
			}

		},
		swiperOpen:function(){
			var _this = this;
			if(!_this.timer && !_this.isMove){
				_this.isMove = true;
				_this.timer = setInterval(function(){
					if(Math.abs(_this.translate - _this.translateDis) >= _this.operEleWidth){
						_this.translate = -_this.operEleWidth;
						clearInterval(_this.timer);
						_this.timer = null;
						_this.isMove = false;
					}else{
						_this.translate -= _this.translateDis;
					}
					setTranslate(_this.parentEle, _this.translate, 0, 0);
				},_this.translateTime);
			}
		},
		swiperClose:function(){
			var _this = this;
			if(!_this.timer && !_this.isMove){
				_this.isMove = true;
				_this.timer = setInterval(function(){
					if((_this.translate - _this.translateDis) <= _this.operEleWidth){
						_this.translate = 0;
						clearInterval(_this.timer);
						_this.timer = null;
						_this.isMove = false;
					}else{
						_this.translate -= _this.translateDis;
					}
					setTranslate(_this.parentEle,_this.translate,0,0);
				},_this.translateTime);
			}
		},
		/**
		 * @method destroy 销毁函数
		 */
		destroy : function() {
			this.swiperClose();
			this.parentEle.removeEventListener(EVENT.START);
			this.parentEle.removeEventListener(EVENT.MOVE);
			this.parentEle.removeEventListener(EVENT.END);
		}
	}

	window[pluginName] = swiperLeft;
})(window,document)