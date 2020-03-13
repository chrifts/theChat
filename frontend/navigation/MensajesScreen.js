import React from 'react';
import axios from 'axios';
import { StyleSheet, FlatList, View, Button, Alert, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { WS_HOST, WS_PORT, API_URL_PORT} from '../constants/Config';
import { Left, Body, Right, Thumbnail, ListItem, Text } from 'native-base';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import GoTo from '../constants/navigate';
import AddChat from '../components/AddChat'
import { Icon, Avatar, Badge, withBadge } from 'react-native-elements'
import { Actions } from 'react-native-router-flux';
import update from 'immutability-helper';
import {parseDate} from '../helpers/dateParse'

let navigated = false;


class MensajesScreen extends React.Component {
  _isMounted = false;
  constructor(props){
    super(props);
    this.state = {
      ws_url: '',
      refreshing: false,
      user_data: '',
      chats: [],
      isFetching: true,
      user_id: '',
      ws: '',
      backRefresh: false,
    }
    //this.getUserChats();
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.getUserChats();
  }

  static navigationOptions = ({ navigation, navigationOptions }) => {
    navigated = true;
    return {
      headerRight: ()=>(
        <AddChat /> 
        
      ),
      //tabBarVisible: false,
      tabBarIcon:({tintColor})=>(
        <Icon name="chat-bubble" color={tintColor} size={24} />
      ),
      
      title:  'Chats',
      
      headerStyle: {
        backgroundColor: '#f6f6f6',
        //height: 80,
      },
      //headerTintColor: "black",
    };
  };

  async getUserChats() {
    let mainView = true;

    const token = await AsyncStorage.getItem('id_token');
    if(token) {
      let axios_config = {
        method: 'GET',
        url: API_URL_PORT+'/user_chats?mainView='+mainView,
        headers: {
            "content-type": "application/json", 
            "authorization": 'Bearer ' + token
        }
      }
      
      const response = await axios(axios_config)
      if(response.status = '200') {
        
        if(response.data.data) {
          response.data.data.forEach((ele, ix)=> {
            response.data.data[ix].lastMessage.count = 0;
          })
          
          response.data.data.forEach((chat, index)=> {
            let count = 0;
            chat.allMessages[0].forEach((msg, ix) => {
              if(msg.readed == '0' && msg.user_transmitter != response.data.user_id ) {  
                count++;
              }
            })
            response.data.data[index].unreaded = count;
          })
          //console.log(response, 'MENSAJESSS');
          //console.log(this.state)
        }

        this.setState(
          {
            ws_url: URL,
            user_data: response.data.user_data,
            user_id: response.data.user_id,
            chats: response.data.data,
            isFetching: false,
            refreshing: false,
            
          });
          return response.data;

      } else {
        console.log(response);
      }
    }  
  }

  keyExtractor = (item, index) => item.id.toString();

  addUserToMainView = (params) => {
    AsyncStorage.getItem('id_token').then((token) => {
      
      let axios_config = {
        method: 'POST',
        url: API_URL_PORT+'/add_user_to_main_view',
        data: params,
        headers: {
            "content-type": "application/json", 
            "authorization": 'Bearer ' + token
        }
      }
      
      axios(axios_config)
      .then((response) => {
          Actions.push('check')
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
    var textAndDate = parseDate(item)
    return (
      <TouchableOpacity
        ref={component => this._touchable = component}
        onPress={() => {
          console.log(item)
          let params = 
            {
              user_id: this.state.user_id,
              receiver: item.id,
              itemData: item,
              writer: this.state.user_data
            }
            this.state.chats.map((IT, ix) => {
              if(IT.id == item.id) {
                console.log(ix, 'AQUI IX')
                var obj = {};
                obj[ix] = {unreaded: {$set: 0}};
                this.setState({
                  chats: update(this.state.chats, obj)
                })
                GoTo('chat', params);
                
              }
            })
        }}
      >
        <ListItem avatar>
              <Left style={{maxHeight: 70}}>
                <Thumbnail source={{ uri: 'https://i0.wp.com/wipy.tv/wp-content/uploads/2019/10/Nueva-imagen-de-Avatar-2.jpg?w=1000&ssl=1' }} />
              </Left>
              <Body style={{height: 70}}>
                <Text >{item.firstName + ' ' + item.lastName}</Text>
                <Text note>{textAndDate.lastMessage}</Text>
              </Body>
              <Right style={{height: 70}}>
                
                <Body style={{width: 80, paddingLeft: 30}}>
                  <Text note style={{fontSize: 13}}>{textAndDate.theDate}</Text>
                  {item.unreaded > 0 ? 
                  <Badge value={item.unreaded > 99 ? '99+' : item.unreaded} status="primary" badgeStyle={{marginTop: 7}}>
                    <Text style={{color:'#fff', fontWeight:'400', fontSize: 12}}> {item.unreaded} </Text>
                  </Badge> : null}
                </Body>
              </Right>
              
        </ListItem>
      </TouchableOpacity>
    );
  }

  drawList = () => {
      return (     
        //User ScrollView for enable scroll refresh 
        <View style={{flex: 1}}
          refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }>
          {this.state.chats ? <FlatList
            data={this.state.chats}
            renderItem={this.renderItem}
            keyExtractor={this.keyExtractor}
          /> : <Text>No chats yet. Add some</Text>}
        </View>                            
      );
  }

  render() { 
    return(
      this.state.isFetching ? <Text>Cargando :)</Text> : this.drawList()
    );
  }

  async componentDidMount() {
    this._isMounted = true;
    this._onFocusListener = this.props.navigation.addListener('didFocus', async (payload) => {
      await this.getUserChats();
    });

    const user_data = await this.getUserChats();
    let URL = 'ws://'+WS_HOST+':'+WS_PORT+'/user_main/'+user_data.user_id;
    console.log(this.state.user_data)
    this.setState({
      ws: new WebSocket(URL, user_data.user_id.toString())
    })
    
    if(!this.state.isFetching) {
      console.log(this.state);
      this.state.ws.onopen = () => {
        // on connecting, do nothing but log it to the console
        console.log('connected '+ this.state.user_id+' in MensajesScreen ' + 'channel: ' + this.state.ws_url)
        //Alert.alert('connected '+ this.state.user_id+' in MensajesScreen ' + 'channel: ' + this.state.ws_url)
      }
      
      this.state.ws.onmessage = evt => {
        // on receiving a message, add it to the list of messages
        let message = JSON.parse(evt.data)
        console.log(message);
        
        //Alert.alert(message.message)
        this.setState({isFetching: true})
        
        this.state.chats.forEach((user, ix)=>{
          if(user.id == message.user_transmitter) {
            
            user.unreaded++;
            user.lastMessage[0] = [message.message, 'Now']
            this.setState({isFetching: false})
          }
        })
      }

      this.state.ws.onclose = () => {
        //Alert.alert('WS disconected from mensajesScreen. Reconnecting...');
        console.log('WS disconected from mensajesScreen. Reconnecting...');
        // this.setState({
        //   ws: new WebSocket(this.state.ws_url),
        // })
        // if(this._isMounted){
        //   this._onRefresh()
        // }
      }
      this.state.ws.onerror = () => {
        //Alert.alert('WS ERROR from mensajesScreen. Reconnecting...');
        console.log('WS ERROR from mensajesScreen. Reconnecting...');
        this.state.ws.close()
        this.setState({
          ws: new WebSocket(this.state.ws_url),
        })
      }
    }
  }
  componentWillUnmount() {
    this.state.ws.close()
    //this._onRefresh();
  }
}
  
export default MensajesScreen;