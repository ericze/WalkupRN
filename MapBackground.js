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
var lastTouchStartTime: number;

// 缩放大小
var scale = 1;
var animatedScale = new Animated.Value(1);
var zoomLastDistance: number = null;
var zoomCurrentDistance = 0;
// 滑动过程中，整体横向过界偏移量
var horizontalWholeOuterCounter = 0;

// 滑动过程中，x y的总位移
var horizontalWholeCounter = 0;
var verticalWholeCounter = 0;

// 双击时的位置
var doubleClickX = 0;
var doubleClickY = 0;

// 上一次点击的时间
var lastClickTime = 0
// 是否双击缩放了
var isDoubleClickScale = false;
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
// 开始手势操作
        lastPositionX = null;
        lastPositionY = null;
        zoomLastDistance = null;
        horizontalWholeCounter = 0;
        verticalWholeCounter = 0;
        lastTouchStartTime = new Date().getTime();

        //如果触摸点数量大于1
        if (evt.nativeEvent.changedTouches.length > 1) {
            centerDiffX = (evt.nativeEvent.changedTouches[0].pageX + evt.nativeEvent.changedTouches[1].pageX) / 2 - windowWidth/2
            centerDiffY = (evt.nativeEvent.changedTouches[0].pageY + evt.nativeEvent.changedTouches[1].pageY) / 2 - windowHeight/ 2
        }else{
            // 一个手指的情况
            if (new Date().getTime() - lastClickTime < 175) {
                // 认为触发了双击
                lastClickTime = 0

                // 因为可能触发放大，因此记录双击时的坐标位置
                doubleClickX = evt.nativeEvent.changedTouches[0].pageX
                doubleClickY = evt.nativeEvent.changedTouches[0].pageY

                // 缩放
                isDoubleClickScale = true
                if (scale > 1 || scale < 1) {
                    // 回归原位
                    scale = 1

                    positionX = 0
                    positionY = 0
                } else {
                    // 开始在位移地点缩放
                    // 记录之前缩放比例
                    // 此时 this.scale 一定为 1
                    const beforeScale = scale

                    // 开始缩放
                    scale = 2

                    // 缩放 diff
                    const diffScale = scale - beforeScale
                    // 找到两手中心点距离页面中心的位移
                    // 移动位置
                    positionX = (windowWidth / 2 - doubleClickX) * diffScale / scale
                    positionY = (windowHeight / 2 - doubleClickY) * diffScale / scale
                }
                Animated.parallel([
                    Animated.timing(animatedScale,{
                        toValue: scale,
                    duration: 100,
                 }),
                    Animated.timing(animatedPositionX, {
                        toValue: positionX,
                    duration: 100,
                    }),
                    Animated.timing(animatedPositionY, {
                        toValue: positionY,
                    duration: 100,
                    })
                ]).start();
            } else {
             lastClickTime = new Date().getTime()
            }
        }

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
                let distanceDiff = (zoomCurrentDistance - zoomLastDistance) / 40

                let zoom = scale + distanceDiff

                if (zoom < 1) {
                    zoom = 1
                }
                if (zoom > 2) {
                    zoom = 2
                }

                // 记录之前缩放比例
                const beforeScale = scale
                // 开始缩放
                scale = zoom
                animatedScale.setValue(scale)

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
        }else{
            // x 位移
            let diffX = gestureState.dx - lastPositionX
            if (lastPositionX === null) {
                diffX = 0
            }
            // y 位移
            let diffY = gestureState.dy - lastPositionY
            if (lastPositionY === null) {
                diffY = 0
            }

            // 保留这一次位移作为下次的上一次位移
            lastPositionX = gestureState.dx
            lastPositionY = gestureState.dy

            horizontalWholeCounter += diffX
            verticalWholeCounter += diffY

            // diffX > 0 表示手往右滑，图往左移动，反之同理
            // horizontalWholeOuterCounter > 0 表示溢出在左侧，反之在右侧，绝对值越大溢出越多
            if (800 * scale > windowWidth) { // 如果图片宽度大图盒子宽度， 可以横向拖拽
                    // 没有溢出偏移量或者这次位移完全收回了偏移量才能拖拽
                    if (horizontalWholeOuterCounter > 0) { // 溢出在右侧
                        if (diffX < 0) { // 从右侧收紧
                            if (horizontalWholeOuterCounter > Math.abs(diffX)) {
                                // 偏移量还没有用完
                                horizontalWholeOuterCounter += diffX
                                diffX = 0
                            } else {

                                // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                                // diffX += horizontalWholeOuterCounter
                                // horizontalWholeOuterCounter = 0
                                // return;
                                //this.props.horizontalOuterRangeOffset(0)
                            }
                        } else { // 向右侧扩增
                            horizontalWholeOuterCounter += diffX
                        }

                    } else if (horizontalWholeOuterCounter < 0) { // 溢出在左侧
                        if (diffX > 0) { // 从左侧收紧
                            if (Math.abs(horizontalWholeOuterCounter) > diffX) {
                                // 偏移量还没有用完
                                horizontalWholeOuterCounter += diffX
                                diffX = 0
                            } else {
                                return;
                                // 溢出量置为0，偏移量减去剩余溢出量，并且可以被拖动
                                // diffX += horizontalWholeOuterCounter
                                // horizontalWholeOuterCounter = 0
                                //this.props.horizontalOuterRangeOffset(0)
                            }
                        } else { // 向左侧扩增
                            horizontalWholeOuterCounter += diffX
                        }
                    } else {
                        // 溢出偏移量为0，正常移动
                    }

                    // 产生位移
                     positionX += diffX / scale

                    // 但是横向不能出现黑边
                    // 横向能容忍的绝对值
                    const horizontalMax = (800 * scale - windowWidth) / 2 / scale
                    if (positionX < -horizontalMax) { // 超越了左边临界点，还在继续向左移动
                        positionX = -horizontalMax

                        // 让其产生细微位移，偏离轨道
                        horizontalWholeOuterCounter += -1 / 1e10
                    } else if (positionX > horizontalMax) { // 超越了右侧临界点，还在继续向右移动
                        positionX = horizontalMax

                        // 让其产生细微位移，偏离轨道
                        horizontalWholeOuterCounter += 1 / 1e10
                    }
                    animatedPositionX.setValue(positionX)
                } else {
                    // 不能横向拖拽，全部算做溢出偏移量
                    horizontalWholeOuterCounter += diffX
                }
            // 溢出量不会超过设定界限
            if (horizontalWholeOuterCounter > 0) {
                horizontalWholeOuterCounter = 0
            } else if (horizontalWholeOuterCounter < 0) {
                horizontalWholeOuterCounter = 0
            }


                if (600 * scale > windowHeight) {
                    // 如果图片高度大图盒子高度， 可以纵向拖拽
                    positionY += diffY / scale
                    animatedPositionY.setValue(positionY)
                }
        }
    }
    // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
    // 一般来说这意味着一个手势操作已经成功完成。
    onPanResponderEnd(evt, gestureState){

       // 双击缩放了，结束手势就不需要操作了
        if (isDoubleClickScale) {
            return
         }
        //先判断是否是单击
        // 手势完成,如果是单个手指、距离上次按住只有预设秒、滑动距离小于预设值,认为是单击
        var stayTime = new Date().getTime() - lastTouchStartTime;
        var moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
        if (evt.nativeEvent.changedTouches.length == 1 && stayTime < 500 && moveDistance < 10){
            //调用单击的方法,将触摸的点相对于父视图的坐标传出去
           // this.clickUp(evt.nativeEvent.locationX,evt.nativeEvent.locationY);
        }

        if (scale < 1) {
            // 如果缩放小于1，强制重置为 1
            scale = 1
        }
            Animated.timing(animatedScale, {
                toValue: scale,
                duration: 100,
            }).start()


        if (800 * scale <= windowWidth) {
            // 如果图片宽度小于盒子宽度，横向位置重置
            positionX = 0
            Animated.timing(animatedPositionX, {
                toValue: positionX,
                duration: 100,
            }).start()
        }

        if (600 * scale <= windowHeight) {
            // 如果图片高度小于盒子高度，纵向位置重置
            positionY = 0
            Animated.timing(animatedPositionY, {
                toValue: positionY,
                duration: 100,
            }).start()
        }

       // 横向肯定不会超出范围，由拖拽时控制
      //  如果图片高度大于盒子高度，纵向不能出现黑边
        if (600 * scale > windowHeight) {
            // 纵向能容忍的绝对值
            const verticalMax = (600 * scale - windowHeight) / 2 / scale
            if (positionY < -verticalMax) {
                positionY = -verticalMax
            } else if (positionY > verticalMax) {
                positionY = verticalMax
            }
            Animated.timing(animatedPositionY, {
                toValue: positionY,
                duration: 100,
            }).start()
        }

    // 拖拽正常结束后,如果没有缩放,直接回到0,0点
    // if (scale === 1) {
    //     positionX = 0
    //     positionY = 0
    //     Animated.timing(animatedPositionX, {
    //         toValue: positionX,
    //         duration: 100,
    //     }).start()
    //     Animated.timing(animatedPositionY, {
    //         toValue: positionY,
    //         duration: 100,
    //     }).start()
    // }

    // 水平溢出量置空
    horizontalWholeOuterCounter = 0
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
    /**
     * 重置大小和位置
     */
     reset() {
        scale = 1
        animatedScale.setValue(scale)
        positionX = 0
        animatedPositionX.setValue(positionX)
        positionY = 0
        animatedPositionY.setValue(positionY)
    }
    render(){
        const animateConf = {
            transform: [{
                scale: animatedScale
            }, {
                translateX: animatedPositionX
            }, {
                translateY: animatedPositionY
            }]
        }

        return(
            <Animated.View style={animateConf}>
                <Image {...this._panResponder.panHandlers}
                   source={require('./mapImage.png')}
                   style={[styles.map,this.state.style]}
                />
            </Animated.View>
        );
    }

}

const styles = StyleSheet.create({
    map:{
        width:800,
        height:600,
        position: 'absolute',
    }
});