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

export default class Encrypter extends React.Component {
  state = {
    text: null,
    data: null,
    type: 'encoding',
    image: false,
    imageSelect: null,
    isUploading: false,
    mainImage: false,
    base64send: null,
    b64: null,
    loading: false,
    scan: false
  };
  componentDidMount() {
    this.getPermissionAsync();
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scan: false, url: data });
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
      if (this.state.ress !== result.uri) {
        alert('Wrong Image selected');
      } else {
        this.setState({ mainImage: true, image: result.uri });
      }
    }
  };

  encode = async () => {
    console.log('--------Encoding!--------');
    this.setState({
      loading: true
    });
    let formData = new FormData();
    formData.append('text', this.state.text);
    // formData.append("image", this.state.file)

    try {
      let res = await axios.post(`${this.state.url}/encode`, formData);
      this.setState({
        b64: `data:image/png;base64,${res.data.image}`,
        data: res.data.key,
        image: `data:image/png;base64,${res.data.image}`,
        wb64: res.data.image
      });

      // json.qr is base64 string "data:image/png;base64,..."

      await FileSystem.writeAsStringAsync(
        FileSystem.documentDirectory + 'temp.png',
        `${res.data.image}`,
        {
          encoding: 'base64'
        }
      );
      await MediaLibrary.requestPermissionsAsync();
      let ress = await MediaLibrary.createAssetAsync(
        FileSystem.documentDirectory + 'temp.png'
      );
      this.setState({
        type: 'decoding',
        loading: false,
        ress: ress.uri
      });
    } catch (err) {
      this.setState({
        loading: false
      });
      alert('Error Encoding Image');
      console.log(err);
    }
  };

  decode = async () => {
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
    formData.append('key', this.state.text);
    formData.append('image', this.state.wb64);

    try {
      let res = await axios.post(`${this.state.url}/decode`, formData);
      this.setState({
        data: res.data.key,
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
    if (this.state.type == 'encoding') {
      return (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
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
            >
              Encoding
            </Text>
            <TouchableOpacity
              style={{
                position: 'absolute',
                right: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                this.setState({
                  text: null,
                  data: null,
                  type: 'encoding',
                  image: false,
                  imageSelect: null,
                  isUploading: false,
                  mainImage: false,
                  base64send: null,
                  b64: null,
                  loading: false
                });
                console.log('State resetted!');
              }}
            >
              <Text
                style={{
                  color: '#4286f4'
                }}
              >
                New
              </Text>
              <EvilIcons name='refresh' size={32} color='#4286f4' />
            </TouchableOpacity>
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
              placeholder='Enter Text to Encrypt'
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
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => this.encode()}
            >
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
                Upload and Encode to an Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                this.setState({
                  type: 'decoding'
                });
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  textAlign: 'center',
                  width: 350,
                  color: '#4286f4'
                }}
              >
                Click To Decode Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  scan: true
                });
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: 'gray',
                  textAlign: 'center'
                }}
              >
                Set URL
              </Text>
            </TouchableOpacity>

            {this.state.scan && (
              <BarCodeScanner
                onBarCodeScanned={e => this.handleBarCodeScanned(e)}
                style={StyleSheet.absoluteFillObject}
              />
            )}
          </View>
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
          >
            Decoding
          </Text>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => {
              this.setState({
                text: null,
                data: null,
                type: 'encoding',
                image: false,
                imageSelect: null,
                isUploading: false,
                mainImage: false,
                base64send: null,
                b64: null,
                loading: false
              });
              console.log('State resetted!');
            }}
          >
            <Text
              style={{
                color: '#4286f4'
              }}
            >
              New
            </Text>
            <EvilIcons name='refresh' size={32} color='#4286f4' />
          </TouchableOpacity>
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
            placeholder='Enter Secret Key'
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
            >{`Decrypted String is : ${this.state.data}`}</Text>
          )}
          {!this.state.data && (
            <TouchableOpacity onPress={() => this.decode()}>
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
                Upload and Decode
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (this.state.type == 'encoding') {
                this.setState({
                  type: 'decoding'
                });
              } else {
                this.setState({
                  type: 'encoding'
                });
              }
            }}
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: 20,
                textAlign: 'center',
                width: 350,
                color: '#4286f4'
              }}
            >
              Click To Encode Image
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
