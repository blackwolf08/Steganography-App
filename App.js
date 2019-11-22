import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  StatusBar,
  Dimensions,
  Text,
  TouchableOpacity
} from 'react-native';
import { AppLoading } from 'expo';
import { AntDesign, Ionicons } from '@expo/vector-icons';

import Encrypter from './Components/Main';
import { Subtitle, Header, Body, Title, Toast } from 'native-base';
import * as Font from 'expo-font';

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;
const { height, width } = Dimensions.get('window');

const isIPhoneX = () =>
  Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS
    ? (width === X_WIDTH && height === X_HEIGHT) ||
      (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
    : false;

const StatusBarHeight = Platform.select({
  ios: isIPhoneX() ? 44 : 20,
  android: StatusBar.currentHeight,
  default: 0
});

export default class App extends React.Component {
  state = {
    isReady: false
  };

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font
    });
    this.setState({ isReady: true });
  }
  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <Header
          style={{
            backgroundColor: '#f1f1f1'
          }}
        >
          <Body
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Title
              style={{
                color: 'black'
              }}
            >
              Steganography
            </Title>
            <Subtitle
              style={{
                color: 'black'
              }}
            >
              An Information Security Project
            </Subtitle>
          </Body>
        </Header>

        <Encrypter />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

    marginTop: StatusBarHeight
  }
});
