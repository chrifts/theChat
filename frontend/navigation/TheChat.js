import React from 'react'
import axios from 'axios';
import { FlatList, StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Keyboard, Dimensions, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { WS_HOST, WS_PORT, API_URL_PORT } from '../constants/Config'

const {StatusBarManager} = NativeModules;

class TheChat extends React.Component {
  
  _isMounted = false;
  constructor(props){
    super(props);
    // this.props.navigation.setParams({
    //   title: this.props.navigation.state.params.itemData.firstName + ' ' + this.props.navigation.state.params.itemData.lastName,
    // });
    user_id = this.props.navigation.state.params.user_id;
    
    let URL = 'ws://'+WS_HOST+':'+WS_PORT+'/';
    let CHN;
    
    if(this.props.navigation.state.params.user_id > this.props.navigation.state.params.receiver) {
      CHN = this.props.navigation.state.params.user_id +'-'+ this.props.navigation.state.params.receiver
    } else {
      CHN = this.props.navigation.state.params.receiver +'-'+ this.props.navigation.state.params.user_id
    }
    let URL_TO_MAIN = 'ws://'+WS_HOST+':'+WS_PORT+'/user_main/'+this.props.navigation.state.params.receiver;
    URL = URL + CHN;
    var protocole = {user_id_ws: this.props.navigation.state.params.user_id, receiver_id_ws: this.props.navigation.state.params.receiver}
    var protpParsed = JSON.stringify(protocole);
    this.state = {
      user_id: this.props.navigation.state.params.user_id,
      receiver_id: this.props.navigation.state.params.receiver,
      receiver_pushToken: '',
      messages: [],
      ws: new WebSocket(URL, this.props.navigation.state.params.user_id.toString()),
      ws_to_main: new WebSocket(URL_TO_MAIN, this.props.navigation.state.params.user_id.toString()),
      thisChannel: CHN,
      message: '',
      keyBoardHidden: '', 
      statusBarHeight: 0
    }
    //console.log(this.state);
    
  }

  static navigationOptions = ({ navigation }) => {
    console.log(navigation, "ACAAAx")
    return {      
      title: navigation.state.params.itemData.firstName +' '+ navigation.state.params.itemData.lastName  ,
      headerStyle: {
        backgroundColor: '#f6f6f6',
        //height: 80,
      },
      //headerTintColor: "black",
    };
  };

  async componentWillUnmount(){    
    this.state.ws.close();
    this.statusBarListener.remove();
    this.state.ws_to_main.close();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this._isMounted = false;
    await this.readMessages();
  }

  _keyboardDidShow() {
    //this.setState({keyBoardHidden: false})
  }

  _keyboardDidHide() {
    //this.setState({keyBoardHidden: true})
    Keyboard.dismiss();
  }

  async readMessages() {
    let CHN;
    
    if(this.props.navigation.state.params.user_id > this.props.navigation.state.params.receiver) {
      CHN = this.props.navigation.state.params.user_id +'-'+ this.props.navigation.state.params.receiver
    } else {
      CHN = this.props.navigation.state.params.receiver +'-'+ this.props.navigation.state.params.user_id
    }
    let data = {
      user_id: this.props.navigation.state.params.user_id,
      receiver_id: this.props.navigation.state.params.receiver,
      channel: CHN,
    }
    ////console.log(data);
    const token = await AsyncStorage.getItem('id_token')
    if(token) {
      let axios_config = {
        method: 'POST',
        url: API_URL_PORT+'/read_messages',
        data: data,
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + token
        }
      }
      const response = await axios(axios_config)
      if(response.status = '200') {
        //console.log(response);
      } else {
        //console.log(error.message);
      }
    }
  }

  getReceiverPushToken = () => {
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/get_receiver_push_token',
      data: {receiver_id: this.state.receiver_id},
      headers: {
        "content-type": "application/json",
      }
    }
    //console.log(axios_config);
    axios(axios_config)
    .then((response) => {
        // handle success
        console.log(response);
        this.setState({receiver_pushToken: response.data.expoPushToken})
      })
      .catch((error) => {
        // handle error
        console.log(error.message);
      })
      .finally(function () {
        // always executed
      });
  }

  sendPush = (message, token) => {
    let data = [message, [this.state.receiver_pushToken]]
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/not_test',
      data: data,
      headers: {
          "content-type": "application/json",
          "authorization": "Bearer " + token
      }
    }
    
    axios(axios_config)
    .then((response) => {
        return response
      })
      .catch((error) => {
        // handle error
        console.log(error.message);
      })
      .finally(function () {
        // always executed
      });
  }

  componentDidMount() {
    //this.getReceiverPushToken();
    this._isMounted = true;

    StatusBarManager.getHeight((statusBarFrameData) => {
      this.setState({statusBarHeight: statusBarFrameData.height});
    });


    this.readMessages();
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardDidShow,
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardDidHide,
    );    
    this.getMessages();
    
    this.state.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
      //Alert.alert('connected in ' + this.state.thisChannel)
    }

    this.state.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      let message = JSON.parse(evt.data)
      //console.log(message);
      this.addMessage(message, true)
    }

    this.state.ws.onclose = () => {
      console.log('WS disconected from theChat: ' + this.state.user_id);
      //Alert.alert('WS disconected from theChat: ' + this.state.user_id);
      if(this._isMounted) {
        this.setState({
          ws: new WebSocket(URL),
          ws_to_main: new WebSocket(URL_TO_MAIN),
        })
      }
    }

    this.state.ws.onerror = () => {
      if(this._isMounted) {
        this.setState({
          ws: new WebSocket(URL),
          ws_to_main: new WebSocket(URL_TO_MAIN),
        })
      }
    }
  }



  addMessage = (message, justAddOnFront = false) => {
    this._isMounted ? this.setState(state => ({ messages: [message, ...state.messages] })) : null;
  }

  submitMessage = (messageString) => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    //console.log(this.state.messages.length);
    const message = { 
      //id: this.state.messages.length + 1,
      name_last: this.props.navigation.state.params.writer.firstName + ' ' + this.props.navigation.state.params.writer.lastName,
      user_transmitter: this.props.navigation.state.params.user_id,
      message: messageString, 
      user_receiver: this.props.navigation.state.params.receiver,
      channel: this.state.thisChannel
    }

    this.addMessage(message)//this is for front

    AsyncStorage.getItem('id_token').then((token) => {
      if(token) {
        //this.sendPush(message, token);
        let axios_config = {
          method: 'POST',
          url: API_URL_PORT+'/new_message',
          data: message,
          headers: {
              "content-type": "application/json",
              "authorization": "Bearer " + token
          }
        }
        //console.log(axios_config);
        axios(axios_config)
        .then((response) => {
            // handle success
            //console.log(response);
          })
          .catch((error) => {
            // handle error
            console.log(error.message);
          })
          .finally(function () {
            // always executed
          });
      }
    }).catch((error) => {
      console.log(error.message);
    });
    this.state.ws.send(JSON.stringify(message))
    this.state.ws_to_main.send(JSON.stringify(message))  
  }

  getMessages = (since = null) => {
    AsyncStorage.getItem('id_token').then((token) => {
      let axios_config = {
        method: 'GET',
        url: API_URL_PORT+'/get_chat_messages?since='+since+'&channel='+this.state.thisChannel,
        headers: {
            "content-type": "application/json", 
            "authorization": 'Bearer ' + token
        }
      }
      axios(axios_config)
      .then((response) => {
          // handle success
          //console.log(response);
          if (this._isMounted) {
            this.setState(
              {
                messages: response.data,
                //isFetching: false
              }
            );
            //console.log(this.state)
          }
          
          //console.log(response);
        })
        .catch((error) => {
          // handle error
          console.log(error.message);
        })
        .finally(function () {
          // always executed
        });
    })
  }

  renderItem = ({item}) => {
    //console.log(item)
    let iSend;
    this.state.user_id == item.user_transmitter ? iSend = true : iSend = false;
    return (
      <View style={styles.row}>
        {/* <Text style={styles.sender}>{item.user_transmitter}</Text> */}
        <Text style={iSend ? styles.iMessage : styles.message}>{item.message}</Text>
      </View>
    );
  }

  keyExtractor = (item, index) => index.toString();

  render() {
    const windowHeight = Dimensions.get('window').height;

    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.messages}
          keyExtractor={this.keyExtractor}  
          renderItem={this.renderItem}
          inverted
        />
        <KeyboardAvoidingView 
          behavior="padding"
          keyboardVerticalOffset={44 + this.state.statusBarHeight}
        >
          <View style={styles.footer}>
            <TextInput
              value={this.state.message}
              style={this.state.inputFocus ? styles.inputFocus : styles.input}
              onChangeText={text => this._isMounted ? this.setState({message: text}) : null}
              onFocus={e => this._isMounted ?  this.setState({inputFocus: true}) : null}
              onBlur={e => this._isMounted ? this.setState({inputFocus: false}) : null}
              placeholder={'Enter message...'}
            />
            <TouchableOpacity 
              onPress={e => {
                e.stopPropagation()
                this.submitMessage(this.state.message)
                this._isMounted ? this.setState({ message: '' }) : null
              }
            }>
              <Text style={styles.send}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

// var pxr;
// PixelRatio.get() === 1 ? pxr = 120 : null;
// PixelRatio.get() === 1.5 ? pxr = 70 : null;
// PixelRatio.get() === 2 ? pxr = 70 : null;
// PixelRatio.get() === 3 ? pxr = 70 : null;
// PixelRatio.get() === 3.5 ? pxr = 70 : null;

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    flex: 1,
  },
  inputFocus: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    flex: 1,
    //marginBottom: pxr,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iMessage: {
    textAlign: 'right',
    color: 'red',
    fontSize: 18,
  },
  message: {
    fontSize: 18,
  },
  sender: {
    fontWeight: 'bold',
    paddingRight: 10,
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20,
  }
});

export default TheChat


