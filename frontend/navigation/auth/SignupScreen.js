import React from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, Keyboard, ScrollView, SafeAreaView, KeyboardAvoidingView, Alert, Picker } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button, Text as Txt } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_URL_PORT } from '../../constants/Config'
import GoTo from '../../constants/navigate';
import {Platform} from 'react-native';
//import Constants from 'expo-constants';
import DeviceInfo from 'react-native-device-info';
//import { Notifications } from 'expo';
//import * as Permissions from 'expo-permissions';
import Contacts from 'react-native-contacts';

class SignupScreen extends React.Component {
  //TODO: GUARDAR EXPOPUSHTOKEN! 
  constructor(props){
    super(props);
    this.state = {
        hasPermission: false,
        name: '',
        surname: '',
        email: '',
        pass: '',
        userContacts: '',
        telPrefix: '',
        localCode: '',
        tel:'',
        signupStep: 1,
        verifyCode: '',
        smsCode: '',
        user_id: '',
        deviceId: DeviceInfo.getDeviceId(),
        countryCodes: [],
        pushToken: ''
    }
  }
  
  sendTheSms = () => {
    
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/sms_verify',
      data: this.state,
      headers: {
          "content-type": "application/json",
      }
    }
    //console.log(axios_config);
    axios(axios_config)
    .then((response) => {
        console.log(response)
        this.setState({user_id: response.data.user_id, smsCode: response.data.verifyCode})
        this._storeData('step', '2')
        this.setState({signupStep: '2'})
      })
      .catch((error) => {
        // handle error
        Alert.alert(error.message +' to '+ API_URL_PORT);
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
    
  }

  getCountryCode = () => {
    let axios_config = {
      method: 'GET',
      url: 'http://country.io/phone.json',
      headers: {
        'Access-Control-Allow-Origin': 'http://192.168.0.32:19006'
      }
    }
    //console.log(axios_config);
    axios(axios_config)
    .then((response) => {
        // handle success
        this.setState(
          {
            countryCodes: response.data,
          }
        );
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }

  validateSMS = () => {
    
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/validate_sms_code',
      data: this.state,
      headers: {
          "content-type": "application/json",
      }
    }
    axios(axios_config)
    .then((response) => {
      this._storeData('step', '3')
      this.setState({signupStep: '3'})
    })
    .catch((error) => {
      // handle error
      
      console.log(error);
    })
    .finally(function () {
      
    });
    
  }

  checkFirstTime = () => {
    
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/check_first_time',
      data: this.state,
      headers: {
          "content-type": "application/json",
      }
    }
    axios(axios_config)
    .then((response) => {
      //console.log(response);
      if(response.data) {
        this._storeData('step', '4')
        GoTo('create_profile', {tel: this.state.tel, prefix: this.state.telPrefix, localCode: this.state.localCode});
      } else {
        this._storeData('step', '5')
        GoTo('messages', null, 'navigate');
      }
      
    })
    .catch((error) => {
      // handle error
      
      console.log(error);
    })
    .finally(function () {
      
    });
    
  }
  
  _storeData = async (item, value) => {
    try {
      await AsyncStorage.setItem(item, value);
    } catch (error) {
      console.log(error)
    }
  };

  saveTokenAndGo = async (item, value) => {
    try {
      await AsyncStorage.setItem(item, value);
      this.checkFirstTime()
      
    } catch (error) {
      console.log(error)
    }
  };

  login = () => {
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/login',
      data: this.state,
      headers: {
          "content-type": "application/json",
      }
    }
    axios(axios_config)
    .then((response) => {
        //Alert.alert('Login Success!');
        this.saveTokenAndGo('id_token', response.data.accessToken)
        
      })
      .catch((error) => {
        // handle error
        Alert.alert('Login error!');
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }

  getContactsAndlogin = () => {

    Contacts.getAll((err, contacts) => {
      if (err) {
        throw err;
      }

      console.log(contacts);
      let data = {
        user_id: this.state.user_id,
        user_digits: this.state.telPrefix + this.state.localCode + this.state.tel,
        contacts: contacts,
        device_os: Platform.OS,
      }
      let axios_config = {
        method: 'POST',
        url: API_URL_PORT+'/set_user_relations',
        data: data,
        headers: {
            "content-type": "application/json",
        }
      }
      axios(axios_config)
        .then((response) => {
            console.log(response)
            //Alert.alert('Done');
            this.login()
          })
        .catch((error) => {
          // handle error
          Alert.alert('Error set_user_relations!');
          console.log(error.message);
          console.log(error);
          throw new Error(error);
        });
    })
  }


  render() {
    
    const ref_input2 = React.createRef();
    const ref_input3 = React.createRef();
    const ref_input4 = React.createRef();

    if(this.state.countryCodes) {
      const entries = Object.entries(this.state.countryCodes)
      //console.log(entries);
      return (
        
        <ScrollView style={styles.container}>
          
          <View style={ this.state.signupStep == '1' ? null : styles.hide}>              
            
            <KeyboardAvoidingView
              behavior="position"
              style={styles.content}
            >
              <Text style={styles.logo}>Insert your phone number</Text>
              <Text style={styles.logoSmall}>We'll send you a SMS with your validation code</Text>
              <Picker
                selectedValue={this.state.telPrefix}
                onValueChange={(itemValue, itemIndex) => {
                  this.setState({telPrefix: itemValue})
                  
                }}>
                {
                  entries.map((element, index) => (
                    <Picker.Item key={index} label={element[0] + ' - ' + element[1]} value={element[1]} />   
                  ))
                }            
              </Picker>
              <TextInput
                ref={ref_input2}
                onSubmitEditing={() => ref_input3.current.focus()}
                returnKeyType="next"
                style={styles.item}
                value={this.state.localCode}
                onChangeText={e => this.setState({ localCode: e })}
                underlineColorAndroid="transparent"
                placeholder="911 (Local code)"
                //keyboardType={'numeric'}
              />
              <TextInput
                ref={ref_input3}
                style={styles.item}
                value={this.state.tel}
                onChangeText={e => this.setState({ tel: e })}
                underlineColorAndroid="transparent"
                placeholder="6185 0022 (Number)"
                //keyboardType={'numeric'}
              />
              
              
              <Button bordered
                onPress={() => {
                  Keyboard.dismiss();
                  this.sendTheSms();
                    
                }}>
                <Txt>Go!</Txt>
              </Button>
          </KeyboardAvoidingView>
        </View>
          <View style={ this.state.signupStep == '2' ? null : styles.hide}>
            <Text style={styles.logo}>SMS sent</Text>
            <Text style={styles.logoSmall}>Enter code next</Text>
            <Text style={styles.logoSmall}>Your code: {this.state.smsCode}</Text>
            <KeyboardAvoidingView
              style={styles.content}
            >
              <TextInput
                  style={styles.item}
                  value={this.state.verifyCode}
                  onChangeText={e => this.setState({ verifyCode: e })}
                  underlineColorAndroid="transparent"
                  placeholder="Six digits code"
                  keyboardType={'numeric'}
              />
              <Button           
                style={styles.mtBtn}
                bordered
                onPress={() => {
                  Keyboard.dismiss();
                  this.validateSMS();
                }}>
                <Txt>Check</Txt>
              </Button>
              <Txt>Not received yet? </Txt>
              <Button 
                disabled
                transparent
                onPress={() => {
                    this.sendTheSms();
                    
                }}
              >
                <Txt>try again and wait</Txt>
              </Button>
            </KeyboardAvoidingView>
            
          </View>
          <View style={this.state.signupStep == '3' ? null : styles.hide}>
            <Text>Done! you are verified</Text>
            <Button           
                style={styles.mtBtn}
                bordered
                onPress={() => {
                    this.getContactsAndlogin()
                }}>
                <Txt>Continue</Txt>
              </Button>
          </View>
          {/* <Button           
            style={styles.mtBtn}
            bordered
            onPress={() => {
                //this.sendTheSms();
                this._storeData('step', '1')
                this.setState({signupStep: '1'})
            }}>
            <Txt>reload</Txt>
          </Button> */}
        </ScrollView>
        
      );
  }
  }

  async componentDidMount(){
    // const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    // if(status !== 'granted') {
    //   Alert.alert('You will not receive notifications. Please change it on your mobile notifications configuration')
    // }
    // let token = await Notifications.getExpoPushTokenAsync();
    // //Alert.alert(token)
    // this.setState({pushToken: token})
    this.getCountryCode();
  
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  container2: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  mtContainer: {
    flex: 1,
  },
  mtBtn: {
    marginTop: 10,
  },
  content: {
    marginTop: 20,
    width: '85%',
    marginLeft: '7.5%',
    
  },
  mainText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 15,
    fontSize: 24
  },
  lightText: {
    textAlign: 'center',
    fontWeight: '100',
    marginTop: 10,
    fontSize: 24
  },
  item: {
    marginTop: 20,
    height: 30,
    borderBottomColor: '#BBB',
    borderBottomWidth: 0.5,
    color: 'black'
  },
  lastItem: {
    marginTop: 20,
    marginBottom: 20,
    height: 30,
    borderBottomColor: '#BBB',
    borderBottomWidth: 0.5
  },
  hide: {
    display: 'none'
  },
  logo: {
    textAlign: 'center',
    marginHorizontal: 20,
    fontWeight: '200',
    fontSize: 42,
  },
  logoSmall: {
    textAlign: 'center',
    marginHorizontal: 20,
    fontWeight: '200',
    fontSize: 24,
  }
})
  
export default SignupScreen;

