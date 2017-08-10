/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Modal
} from 'react-native';

import ImageViewer from 'react-native-image-zoom-viewer';
import MapBackground from './MapBackground';


const images = [{
    url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1501736842621&di=a2ff3fb5c6ada524647ddb0b7f938127&imgtype=0&src=http%3A%2F%2Fimg01.taopic.com%2F150412%2F235052-15041212425160.jpg'
}]



class MyApp extends React.Component {
    render() {
        return (
            <MapBackground/>
        )
    }
}

AppRegistry.registerComponent('MyApp', () => MyApp);
