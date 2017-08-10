import React, { Component } from 'react';
import {
	AppRegistry,
	View,
	Alert,
	TouchableOpacity,
	Text,
	Linking,
	StyleSheet,
	Platform,
	ScrollView
} from 'react-native';

import {
	isFirstTime,
	isRolledBack,
	packageVersion,
	currentVersion,
	checkUpdate,
	downloadRootDir,
	downloadUpdate,
	switchVersion,
	switchVersionLater,
	markSuccess
} from 'react-native-update';

import _updateConfig from './update.json';
// import Help from '../help/Help';

const { appKey } = _updateConfig[Platform.OS];

// import App from './main/index/App.js';

export default class Hello extends Component{
	constructor(props) {
		super(props);
		// this.Help = new Help();
		this.state = { showText: true };
		this.interval = setInterval(() => {
			this.setState({ showText: !this.state.showText });
		}, 1000);
		this.blinkText = null;
	}

	componentWillMount() {
		isFirstTime ? Alert.alert('提示', '这是当前版本第一次启动,是否要模拟启动失败?失败将回滚到上一版本', [
			{
				text: '是', onPress: () => {
					throw new Error('模拟启动失败,请重启应用')
				}
			},
			{
				text: '否', onPress: () => {
					markSuccess()
				}
			},
		]) : (isRolledBack ? Alert.alert('提示', '刚刚更新失败了,版本被回滚.') : void 0)
	}

	componentWillUnmount() {
		clearInterval(this.interval);
	}

	doUpdate(info) {
		downloadUpdate(info).then(hash => {
			Alert.alert('提示', '下载完毕,是否重启应用?'+hash, [
				{
					text: '是', onPress: () => {
						// Alert.alert(hash);
						switchVersion(hash);
					}
				},
				{text: '否',},
				{
					text: '下次启动时', onPress: () => {
						switchVersionLater(hash);
					}
				},
			])
		}).catch(err => {
			Alert.alert('提示', err + '更新失败.' + JSON.stringify(info));
		})
	}

	checkUpdate(e) {
		// info: {"update": boolean, "hash": string, "name":string, "metaInfo":string, "updateUrl": string,"ok":1}
		checkUpdate(appKey).then(info => {
			if (info.expired) {
				Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
					{
						text: '确定', onPress: () => {
						info.downloadUrl && Linking.openURL(info.downloadUrl)
					}
					},
				]);
			} else if (info.upToDate) {
				Alert.alert('提示', '您的应用版本已是最新.');
			} else {
				Alert.alert('提示', '检查到新的版本' + info.name + ',是否下载?\n' + info.description, [
					{
						text: '是', onPress: () => {
							this.doUpdate(info)
						}
					},
					{text: '否',},
				])
			}
		}).catch(err => {
			Alert.alert('提示', '更新失败.');
		})
	}

	render() {
        return(
			<ScrollView style={styles.mainStyle}
						bouncesZoom={true}
						maximumZoomScale={3.0}
						horizontal={true}

				>
                {this.renderItem()}
			</ScrollView>
        );
		// return this.Help.app_render(this, main, { libSelect: true })
	}
    renderItem() {
        // 数组
        var itemAry = [];
        // 颜色数组
        var colorAry = ['gray', 'green', 'blue', 'yellow', 'black', 'orange'];
        // 遍历
        for (var i = 0; i<colorAry.length; i++) {
            itemAry.push(
				<View key={i} style={[styles.itemStyle, {backgroundColor: colorAry[i]}]}></View>
            );
        }
        return itemAry;
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    itemStyle: {
        // 尺寸
        width:1000,
        height:200
    },
    mainStyle: {
    	//尺寸
		width:2000,
		height:2000,
		backgroundColor:'green',
        top:-500,
        left:-500,
	},
})