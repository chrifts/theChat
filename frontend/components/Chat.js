import React from 'react'
import axios from 'axios';
import { FlatList, StyleSheet, View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { WS_HOST, WS_PORT, API_URL_PORT } from '../constants/Config'



class Chat extends React.Component {
  _isMounted = false;
  constructor(props){
    
    super(props);
    
    let URL = 'ws://'+WS_HOST+':'+WS_PORT+'/';
    let CHN;
    
    if(this.props.user_id > this.props.receiver) {
      CHN = this.props.user_id +'-'+ this.props.receiver
    } else {
      CHN = this.props.receiver +'-'+ this.props.user_id
    }
    URL = URL + CHN;
    this.state = {
      user_id: this.props.user_id,
      receiver_id: this.props.receiver,
      messages: [],
      ws: new WebSocket(URL),
      thisChannel: CHN,
      message: '',
    }
    //console.log(this.state);
  }
  
  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    this.getMessages();
    
    this.state.ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      //console.log('connected')
    }

    this.state.ws.onmessage = evt => {
      // on receiving a message, add it to the list of messages
      let message = JSON.parse(evt.data)
      //console.log(message);
      this.addMessage(message, true)
    }

    this.state.ws.onclose = () => {
      //console.log('disconnected')
      // automatically try to reconnect on connection loss
      if (this._isMounted) {
        this.setState({
          ws: new WebSocket(URL),
        })
      }
    }
  }

  addMessage = (message, justAddOnFront = false) => {
    //console.log(message);
    this._isMounted ? this.setState(state => ({ messages: [message, ...state.messages] })) : null;
  }

  submitMessage = (messageString) => {
    // on submitting the ChatInput form, send the message, add it to the list and reset the input
    //console.log(this.state.messages.length);
    const message = { 
      //id: this.state.messages.length + 1,
      user_transmitter: this.props.user_id, 
      message: messageString, 
      user_receiver: this.props.receiver,
      channel: this.state.thisChannel
    }

    this.addMessage(message)

    AsyncStorage.getItem('id_token').then((token) => {
      if(token) {
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
            console.log(error);
          })
          .finally(function () {
            // always executed
          });
      }
    }).catch((error) => {
      console.log(error)
    });
    this.state.ws.send(JSON.stringify(message))  
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
          console.log(error);
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
        <Text style={styles.sender}>{item.user_transmitter}</Text>
        <Text style={iSend ? styles.iMessage : styles.message}>{item.message}</Text>
      </View>
    );
  }

  keyExtractor = (item, index) => index.toString();

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.messages}
          keyExtractor={this.keyExtractor}  
          renderItem={this.renderItem}
          inverted
        />
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.footer}>
            <TextInput
              value={this.state.message}
              style={this.state.inputFocus ? styles.inputFocus : styles.input}
              onChangeText={text => this._isMounted ? this.setState({message: text}) : null}
              onFocus={e => this._isMounted ? this.setState({inputFocus: true}) : null}
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
    marginBottom: 80
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

export default Chat