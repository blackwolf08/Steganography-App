import * as React from 'react';
import {
  Button,
  Image,
  View,
  Text,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Clipboard,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { EvilIcons, Ionicons } from '@expo/vector-icons';

import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import * as MediaLibrary from 'expo-media-library';
import jiitLogo from '../assets/jiit.png';
import imagePlaceholder from '../assets/preview.png';
import wait from '../assets/wait.gif';
import { BarCodeScanner } from 'expo-barcode-scanner';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 40;

export default class Encrypter extends React.Component {
  state = {
    text: null,
    data: null,
    type: 'no-data',
    image: false,
    imageSelect: null,
    isUploading: false,
    mainImage: false,
    base64send: null,
    b64: null,
    loading: false,
    hasCameraPermission: null,
    scan: false,
    img: null
  };
  componentDidMount() {
    this.getPermissionAsync();
    this._requestCameraPermission();
  }
  _requestCameraPermission = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission: status === 'granted'
    });
  };

  _handleBarCodeRead = data => {
    Alert.alert('Scan successful!', JSON.stringify(data));
  };

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };
  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1
    });

    if (!result.cancelled) {
      let img = await FileSystem.readAsStringAsync(result.uri, {
        encoding: 'base64'
      });
      img = img.replace('data:image/jpeg;base64,', '');
      this.setState({ mainImage: true, image: result.uri, img });
    }
  };

  getReport = async () => {
    console.log('--------Decoding!--------');
    this.setState({
      loading: true
    });
    // let file = await FileSystem.readAsStringAsync(this.state.mainimage, { encoding: 'base64' });
    // console.log(file.substring(0,50))
    // this.setState({
    //     base64send: file
    // })

    let formData = new FormData();
    formData.append('patient_name', this.state.text);
    formData.append('image_str', this.state.img);

    try {
      let res = await axios.post(`${this.state.url}/detect`, formData);
      this.setState({
        data: `${res.data.is_cancer} ${res.data.prob}`,
        image: null,
        loading: false
      });
    } catch (err) {
      alert('Decoding Image Failed!');
      this.setState({
        loading: false
      });
      console.log(err);
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold'
            }}
          >
            Please Wait while we are at it!
          </Text>
          <Image
            style={{
              height: HEIGHT / 2,
              width: WIDTH - 100,
              resizeMode: 'contain'
            }}
            source={wait}
          ></Image>
        </View>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <SafeAreaView>
          <KeyboardAvoidingView
            behavior='position'
            keyboardVerticalOffset={keyboardVerticalOffset}
          >
            <View
              style={{
                backgroundColor: '#fff',
                height: HEIGHT - 100,
                width: WIDTH - 50,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'space-around',
                position: 'relative'
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 24
                }}
              ></Text>
              <Image
                source={jiitLogo}
                style={{
                  width: 100,
                  height: 150,
                  resizeMode: 'contain',
                  borderRadius: 20
                }}
              />
              <TextInput
                placeholder='Enter your Name'
                style={{
                  height: 40,
                  width: WIDTH - 100,
                  borderWidth: 0,
                  textAlign: 'center',
                  color: 'black',
                  backgroundColor: '#fff',
                  borderBottomColor: '#d9d9d9',
                  borderBottomWidth: 2
                }}
                onChangeText={text => this.setState({ text: text })}
              />
              <TouchableOpacity
                style={{
                  width: WIDTH - 100,
                  height: 150,
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  opacity: 1,
                  borderRadius: 20,
                  position: 'relative'
                }}
                onPress={() => this._pickImage()}
              >
                {this.state.image && (
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      borderRadius: 20,
                      opacity: 0.5
                    }}
                    source={{ uri: this.state.image }}
                  ></Image>
                )}
                {!this.state.image && (
                  <Image
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      borderRadius: 20,
                      opacity: 0.5
                    }}
                    source={imagePlaceholder}
                  ></Image>
                )}

                <Text
                  style={{
                    color: 'black',
                    backgroundColor: '#ffffff99',
                    fontFamily: 'Roboto',
                    textAlign: 'center',
                    width: WIDTH - 100,
                    height: 40,
                    textAlignVertical: 'center',
                    fontWeight: 'bold',
                    opacity: 1
                  }}
                >
                  {this.state.image
                    ? 'Tap to choose another Image'
                    : 'Tap Pick an Image from Camera Roll'}
                </Text>
              </TouchableOpacity>

              {this.state.data && (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 'bold'
                  }}
                >{`Detected/Predicted Carcinogenic percentage : ${this.state.data}`}</Text>
              )}
              <TouchableOpacity onPress={() => this.getReport()}>
                <Text
                  style={{
                    alignItems: 'center',
                    textAlign: 'center',
                    width: WIDTH - 100,
                    fontWeight: 'bold',
                    fontSize: 15,
                    backgroundColor: '#404040',
                    height: 50,
                    paddingTop: 15,
                    color: 'white',
                    elevation: 1,
                    borderRadius: 20
                  }}
                >
                  Get Report
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    scan: true
                  });
                }}
              >
                <Text>Get Server URL</Text>
              </TouchableOpacity>
              {this.state.scan && (
                <BarCodeScanner
                  onBarCodeScanned={e => this.handleBarCodeScanned(e)}
                  style={StyleSheet.absoluteFillObject}
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scan: false, url: data });
  };
}
