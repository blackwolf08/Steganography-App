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
import { Asset } from 'expo-asset';
import Encrypter from './Components/Main';
import { Subtitle, Header, Body, Title, Toast } from 'native-base';
import * as Font from 'expo-font';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;
const { height, width } = Dimensions.get('window');

function cacheImages(images) {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

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

class App extends React.Component {
  static navigationOptions = {
    title: 'Information Security Project'
  };

  state = {
    isReady: false
  };

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font
    });
    this._loadAssetsAsync();
    this.setState({ isReady: true });
  }
  async _loadAssetsAsync() {
    const imageAssets = cacheImages([
      require('./assets/preview.png'),
      require('./assets/jiit.png'),
      require('./assets/wait.gif')
    ]);

    await Promise.all([...imageAssets]);
  }
  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }
    return (
      <View
        style={{
          flex: 1
        }}
      >
        <StatusBar backgroundColor='#f1f1f1' barStyle='dark-content' />
        <View style={styles.container}>
          <Encrypter />
        </View>
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

const AppNavigator = createStackNavigator(
  { Home: App },
  {
    headerLayoutPreset: 'center',
    initialRouteName: 'Home'
  }
);

export default createAppContainer(AppNavigator);
