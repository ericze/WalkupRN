/**
 * Created by wangzelin on 2017/8/10.
 */
'use strict'
import React, { Component } from 'react'
import {
    StyleSheet,
    Image,
    PanResponder,
    Dimensions,
    Animated,
    Alert,
    PanResponderInstance,
    LayoutChangeEvent
}from 'react-native'

var _currentLeft = 0;
var _currentTop = 0;

var windowWidth = Dimensions.get('window').width;
var windowHeight = Dimensions.get('window').height;

var lastLeft = 0;
var lastTop = 0;

//两手距离中心点位置
var centerDiffX = 0;
var centerDiffY = 0;

// 上次/当前/动画 x 位移
var lastPositionX: number = null;
var positionX = 0;
var animatedPositionX = new Animated.Value(0);

// 上次/当前/动画 y 位移
var lastPositionY: number = null;
var positionY = 0;
var animatedPositionY = new Animated.Value(0);

// 上次手按下去的时间
var lastTouchStartTime: number

// 缩放大小
var scale = 1
var animatedScale = new Animated.Value(1)
var zoomLastDistance: number = null
var zoomCurrentDistance = 0

//自定义地图

export default class MapBackground extends Component{




    constructor(props){
        super(props);

        this.state = {
          style:{
             left:0,
             top:0
          },
        }

        this.props = {
            leaveStayTime : 500,
            leaveDistance : 10
        }

        this.onStartShouldSetPanResponder=this.onStartShouldSetPanResponder.bind(this);
        this.onMoveShouldSetPanResponder=this.onMoveShouldSetPanResponder.bind(this);
        this.onPanResponderGrant=this.onPanResponderGrant.bind(this);
        this.onPanResponderMove=this.onPanResponderMove.bind(this);
        this.onPanResponderEnd=this.onPanResponderEnd.bind(this);
    }

    //用户开始触摸屏幕的时候，是否愿意成为响应者；
    onStartShouldSetPanResponder(evt, gestureState){
        return true;
    }
    //在每一个触摸点开始移动的时候，再询问一次是否响应触摸交互；
    onMoveShouldSetPanResponder(evt, gestureState){
        return true ;
    }
    // 开始手势操作。给用户一些视觉反馈，让他们知道发生了什么事情！
    onPanResponderGrant(evt, gestureState){
        console.log('onPanResponderGrant...');

        lastTouchStartTime = new Date().getTime();

        //如果触摸点数量大于1
        if (evt.nativeEvent.changedTouches.length > 1) {
            centerDiffX = (evt.nativeEvent.changedTouches[0].pageX + evt.nativeEvent.changedTouches[1].pageX) / 2 - this.props.cropWidth / 2
            centerDiffY = (evt.nativeEvent.changedTouches[0].pageY + evt.nativeEvent.changedTouches[1].pageY) / 2 - this.props.cropHeight / 2
        }
        this.setState({
            style:{
                backgroundColor:'red',
                left:_currentLeft,
                top:_currentTop,
            }
        });
    }
    // 最近一次的移动距离为gestureState.move{X,Y}
    onPanResponderMove(evt, gestureState){
        //触摸点>1,缩放
        if(evt.nativeEvent.changedTouches.length>1){
            let minX: number
            let maxX: number
            if (evt.nativeEvent.changedTouches[0].locationX > evt.nativeEvent.changedTouches[1].locationX) {
                minX = evt.nativeEvent.changedTouches[1].pageX
                maxX = evt.nativeEvent.changedTouches[0].pageX
            } else {
                minX = evt.nativeEvent.changedTouches[0].pageX
                maxX = evt.nativeEvent.changedTouches[1].pageX
            }

            let minY: number
            let maxY: number
            if (evt.nativeEvent.changedTouches[0].locationY > evt.nativeEvent.changedTouches[1].locationY) {
                minY = evt.nativeEvent.changedTouches[1].pageY
                maxY = evt.nativeEvent.changedTouches[0].pageY
            } else {
                minY = evt.nativeEvent.changedTouches[0].pageY
                maxY = evt.nativeEvent.changedTouches[1].pageY
            }

            const widthDistance = maxX - minX
            const heightDistance = maxY - minY
            const diagonalDistance = Math.sqrt(widthDistance * widthDistance + heightDistance * heightDistance)
            //四舍五入
            zoomCurrentDistance = Number(diagonalDistance.toFixed(1))

            if (zoomLastDistance !== null) {
                let distanceDiff = (zoomCurrentDistance - zoomLastDistance) / 200
                let zoom = scale + distanceDiff

                if (zoom < 1) {
                    zoom = 1
                }
                if (zoom > 2) {
                    zoom = 2
                }

                // 记录之前缩放比例
                const beforeScale = this.scale

                // 开始缩放
                scale = zoom
                animatedScale.setValue(this.scale)

                // 图片要慢慢往两个手指的中心点移动
                // 缩放 diff
                const diffScale = scale - beforeScale
                // 找到两手中心点距离页面中心的位移
                // 移动位置
                positionX -= centerDiffX * diffScale / scale
                positionY -= centerDiffY * diffScale / scale
                animatedPositionX.setValue(positionX)
                animatedPositionY.setValue(positionY)
            }
            zoomLastDistance = zoomCurrentDistance
        }
        _currentLeft=lastLeft+gestureState.dx;
        _currentTop=lastTop+gestureState.dy;

        if(_currentLeft<=-100){
            _currentLeft=-100;
        }
        if(_currentTop<=-100){
            _currentTop=-100;
        }
        if(_currentLeft>=windowWidth-300){
            _currentLeft=windowWidth-300;
        }
        if(_currentTop>=windowHeight-500){
            _currentTop=windowHeight-500;
        }

        //实时更新
        this.setState({
            style:{
                backgroundColor:'red',
                left:_currentLeft,
                top:_currentTop,
            }
        });
    }
    // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
    // 一般来说这意味着一个手势操作已经成功完成。
    onPanResponderEnd(evt, gestureState){

        //先判断是否是单击
        // 手势完成,如果是单个手指、距离上次按住只有预设秒、滑动距离小于预设值,认为是单击
        var stayTime = new Date().getTime() - lastTouchStartTime;
        var moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);

        if (evt.nativeEvent.changedTouches.length == 1 && stayTime < 500 && moveDistance < 10){
            //调用单击的方法,将触摸的点相对于父视图的坐标传出去
            this.clickUp(evt.nativeEvent.locationX,evt.nativeEvent.locationY);
        }

        lastLeft=_currentLeft;
        lastTop=_currentTop;

        this.changePosition();

    }

    /**
     根据位置做出相应处理
     **/
    changePosition(){
        this.setState({
            style:{
                left:_currentLeft,
                top:_currentTop,
            }
        });
        // if(_previousLeft+CIRCLE_SIZE/2<=Util.size.width/2){
        //     //left

        //     _previousLeft=lastLeft=0;
        //
        //     this.setState({
        //         style:{
        //             left:_previousLeft,
        //             top:_previousTop,
        //         }
        //     });
        // }else{
        //     _previousLeft=lastLeft=Util.size.width-CIRCLE_SIZE;
        //
        //     this.setState({
        //         style:{
        //             left:_previousLeft,
        //             top:_previousTop,
        //         }
        //     });
        // }
    }

    componentWillMount(evt, gestureState){
        this._panResponder=PanResponder.create({
            onStartShouldSetPanResponder:this.onStartShouldSetPanResponder,
            onMoveShouldSetPanResponder:this.onMoveShouldSetPanResponder,
            onPanResponderGrant:this.onPanResponderGrant,
            onPanResponderMove:this.onPanResponderMove,
            onPanResponderRelease:this.onPanResponderEnd,
            onPanResponderTerminate:this.onPanResponderEnd,
        });
    }

    clickUp(x,y){
        Alert.alert('x:'+String(x)+',y:'+String(y));
    }
    render(){
        return(
            <Image {...this._panResponder.panHandlers}
                   source={require('./mapImage.png')}
                   style={[styles.map,this.state.style]}
            />
        );
    }

}

const styles = StyleSheet.create({
    map:{
        width:600,
        height:600,
        position: 'absolute',
    }
});