import React from 'react'
import axios from 'axios';
import { FlatList, StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Button, TouchableOpacity, Keyboard, AppState, NativeModules, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { WS_HOST, WS_PORT, API_URL_PORT } from '../constants/Config'
import ChatBubble from '../components/ChatBubble'
import GoTo from '../constants/navigate';
import {Actions} from 'react-native-router-flux';
import {MensajesScreen} from '../navigation/MensajesScreen'
import store from "../store/index";
import { addArticle } from "../actions/index"; 

const {StatusBarManager} = NativeModules;

class TheChat extends React.Component {
  
  _isMounted = false;
  constructor(props){
    super(props);
    // this.props.navigation.setParams({
    //   title: this.props.navigation.state.params.itemData.firstName + ' ' + this.props.navigation.state.params.itemData.lastName,
    // });
    user_id = this.props.navigation.state.params.user_id;
    this.myRef = React.createRef();
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
    
    this.state = {
      user_id: this.props.navigation.state.params.user_id,
      receiver_id: this.props.navigation.state.params.receiver,
      receiver_pushToken: '',
      messages: [],
      ws: new WebSocket(URL, this.props.navigation.state.params.user_id.toString()),
      ws_to_main: new WebSocket(URL_TO_MAIN, this.props.navigation.state.params.user_id.toString()),
      url_to_main_ws: URL_TO_MAIN,
      url_ws: URL,
      thisChannel: CHN,
      appState: AppState.currentState,
      message: '',
      keyBoardHidden: '', 
      statusBarHeight: 0, 
      writing: false,
      otherIsWriting: false,
      canPublish: true,
      throttleTime: 4000, //4 seconds
    }
    //console.log(this.state);
    
  }

  static navigationOptions = ({ navigation }) => {
    return {   
      headerTitle: (
        <View>
          <Text style={{fontWeight: '600'}}>{navigation.state.params.itemData.firstName +' '+ navigation.state.params.itemData.lastName}</Text>
          <Text style={{fontSize: 12, fontWeight: '200'}}>{navigation.state.params.otherTyping ? 'Typing...' : null}</Text>
        </View>
      ),   
      //title: navigation.state.params.itemData.firstName +' '+ navigation.state.params.itemData.lastName,
      headerStyle: {
        backgroundColor: '#f6f6f6',
        //height: 80,
      },
      headerLeft: ()=>(
        <Button 
          onPress={() => Actions.pop({refresh: this.state})}

          title={'Back'}
        />
      )
      //headerTintColor: "black",
    };
  };

  _handleAppStateChange = (nextAppState) => {
    if ( this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground TO THE CHAT!');
      this.getMessages()
      if(this.state.ws.readyState !== 1 && this._isMounted) {
        this.setState({
          ws: new WebSocket(this.state.url_ws, this.props.navigation.state.params.user_id.toString()),
          ws_to_main: new WebSocket(this.state.url_to_main_ws, this.props.navigation.state.params.user_id.toString()),
        })
      }
    } else {
      console.log('App is gone to foreground FROM THE CHAT');
      //Cuando se va al foreground, desconectar WS      
      
    }
    if(this._isMounted) {
      this.setState({appState: nextAppState});
    }
  };

  componentWillUnmount(){   
    AppState.removeEventListener('change', this._handleAppStateChange); 
    this.state.ws.close();
    //this.statusBarListener.remove();
    this.state.ws_to_main.close();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.readMessages();
    this._isMounted = false;
  }

  _keyboardDidShow() {
    //this.setState({keyBoardHidden: false})
  }

  _keyboardDidHide() {
    //this.setState({keyBoardHidden: true})
    Keyboard.dismiss();
  }

  async readMessages() {
    let data = {
      user_id: this.props.navigation.state.params.user_id,
      receiver_id: this.props.navigation.state.params.receiver,
      channel: this.state.thisChannel,
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
        //console.log(response);
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
    console.log(this.props.navigation);
    this._isMounted = true;
    AppState.addEventListener('change', this._handleAppStateChange);

    
    StatusBarManager.getHeight((statusBarFrameData) => {
      if(this._isMounted) {
        this.setState({statusBarHeight: statusBarFrameData.height});
      }
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
      //console.log('connected')
      //Alert.alert('connected in ' + this.state.thisChannel)
    }

    this.state.ws.onmessage = async(evt) => {
      // on receiving a message, add it to the list of messages
      let message = JSON.parse(evt.data)
      //await this.readMessages();
      if(message.toSend) {

        this.addMessage(message, true)
        return;  
      } 
      
      if(message.writing == true) {
        this.props.navigation.setParams({ otherTyping: true})
        if(this._isMounted) {
          this.setState({otherIsWriting: true})
        }
      } else {
        this.props.navigation.setParams({ otherTyping: false})
        if(this._isMounted) {
          this.setState({otherIsWriting: false})
        }
      }
    }

    this.state.ws.onclose = () => {
      if(this._isMounted){
        // this.setState({
        //   ws: new WebSocket(this.state.url_ws),
        // })
      }
      //Alert.alert('WS disconected from theChat: ' + this.state.user_id);
    }

    this.state.ws.onerror = () => {
      // if(this._isMounted) {
      //   this.setState({
      //     ws: new WebSocket(URL),
      //     ws_to_main: new WebSocket(URL_TO_MAIN),
      //   })
      // }
      //this.state.ws.close()
    }
    //WS TO MAIN
    this.state.ws_to_main.onclose = () => {
      if(this._isMounted){
        // this.setState({
        //   ws_to_main: new WebSocket(this.state.url_to_main_ws),
        // })
      }
      //Alert.alert('WS disconected from theChat: ' + this.state.user_id);
    }

    this.state.ws_to_main.onerror = () => {
      // if(this._isMounted) {
      //   this.setState({
      //     ws: new WebSocket(URL),
      //     ws_to_main: new WebSocket(URL_TO_MAIN),
      //   })
      // }
      //this.state.ws_to_main.close()
    }
  }



  addMessage = (message, justAddOnFront = false, writing = false) => {
    console.log(message);
    
    if(message.toSend) { 
      this.writing(false)
      this._isMounted ? this.setState(state => ({ messages: [message, ...state.messages] })) : null;
      return;
    }
      
    if(writing == 'writing') {
      console.log('entro a writing')
      //var array = [...this.state.messages];
      //this._isMounted ? this.setState(state => ({ messages: array.slice(1) })) : null;
      message.message = 'Typing...'
      this._isMounted ? this.setState(state => ({ messages: [message, ...state.messages] })) : null;
    }
    if(writing == 'noWriting') {
      console.log('entro a noWriting')
      var array = [...this.state.messages];
      this._isMounted ? this.setState(state => ({ messages: array.slice(1) })) : null;
      //this._isMounted ? this.setState(state => ({ messages: [message, ...state.messages] })) : null;
    }

  }

  submitMessage = (messageString) => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    
    const message = {
      toSend: true,
      name_last: this.props.navigation.state.params.writer.firstName + ' ' + this.props.navigation.state.params.writer.lastName,
      user_transmitter: this.props.navigation.state.params.user_id,
      message: messageString, 
      user_receiver: this.props.navigation.state.params.receiver,
      channel: this.state.thisChannel,
      createdAt: new Date(Date.now())
    }
    // var newState = store.getState()
    // console.log(newState)
    // if(newState) {
    //   newState.articles.main_state.data.forEach((el, ix) => {
    //     console.log(el, ix)
    //     if(el.id == message.user_receiver) {
    //       el.lastMessage[0] = [message.message, 0]
    //     }
    //   })
    //   console.log(newState)
    //   store.dispatch( addArticle({main_state: newState}));
    // }
    

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
      // <View style={styles.row}>
      //   {/* <Text style={styles.sender}>{item.user_transmitter}</Text> */}
      //   <Text style={iSend ? styles.iMessage : styles.message}>{item.message}</Text>
      // </View>
      <ChatBubble
        message={item.message}
        sender={item.user_transmitter}
        iSend={iSend}
        allData={item}
        
      />
    );
  }


  keyExtractor = (item, index) => index.toString();
  
  writing = (state) => {
    if(state) {
      this.state.ws.send(JSON.stringify({writing: true}))
      this.state.ws_to_main.send(JSON.stringify({writing: true, user_id: this.state.user_id}))
      this.setState({writing: true});
    } else {
      this.state.ws.send(JSON.stringify({writing: false}))
      this.state.ws_to_main.send(JSON.stringify({writing: false, user_id: this.state.user_id}))
      this.setState({writing: false});
    }
  }

  render() {
    const disableInput = () => {
      if (!this.state.message.replace(/\s/g, '').length) {
        return true;
      } else {
        return false;
      }
    }
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
              onChangeText={text => {
                  var theThis = this;
                  if(this._isMounted) {
                    this.setState({message: text});
                    if(this.state.canPublish) {
                      //POST here
                      this.writing(true);
                      this.setState({canPublish: false});
                      setTimeout(function() {  
                        theThis.writing(false);
                        theThis.setState({canPublish: true});
                      }, this.state.throttleTime);
                    }
                  } 
                }
              }
              onFocus={e => this._isMounted ?  this.setState({inputFocus: true}) : null}
              onBlur={e => this._isMounted ? this.setState({inputFocus: false}) : null}
              placeholder={'Enter message...'}
            />
            <TouchableOpacity 
              disabled={disableInput()}
              onPress={e => {
                e.stopPropagation()
                this.submitMessage(this.state.message.trim())
                this._isMounted ? this.setState({ message: '' }) : null
              }
            }>
              <Text style={[styles.send, {color: disableInput() ? 'grey' : 'lightseagreen'}]}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#eee',
  },
  input: {
    color: 'black',
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    flex: 1,
  },
  inputFocus: {
    color: 'black',
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
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20,
  }
});

export default TheChat


