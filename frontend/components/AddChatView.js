import React from 'react';
import axios from 'axios';
import { StyleSheet, FlatList, View, Button, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL_PORT} from '../constants/Config';
import { Left, Body, Right, Thumbnail, ListItem, Text } from 'native-base';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import GoTo from '../constants/navigate';
import Contacts from 'react-native-contacts';
import { Icon } from 'react-native-elements'


class AddChatView extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      loadingContacts: true,
      user_data: '',
      chats: '',
      isFetching: false,
      user_id:'',
    }
  }

  _setState = async () => {
    const contacts = await AsyncStorage.getItem('state');
    console.log(JSON.parse(contacts));
    if(contacts) {
      this.setState(JSON.parse(contacts))
    }
  }

  _storeChats = async (data) => {
    try {
      await AsyncStorage.setItem('state', JSON.stringify(data));
    } catch (error) {
      // Error saving data
    }
  };

  async getUserChats() {
    let mainView = false;
    const token = await AsyncStorage.getItem('id_token')
    let axios_config_user = {
      method: 'GET',
      url: API_URL_PORT+'/get_user_data',
      headers: {
          "content-type": "application/json", 
          "authorization": 'Bearer ' + token
      }
    }
    const userData = await axios(axios_config_user)
    if(userData.status == 200) {
      var result = false;
      let data = {
        isForUpdate: true,
        user_id: userData.data.id,
        user_digits: userData.data.digits,
        device_os: Platform.OS,
      }
      Contacts.getAll( async (err, contacts) => {
        if (err) {
          throw err;
        }
        //Do
        let dataPost = {
          isForUpdate: data.isForUpdate,
          user_id: data.user_id,
          user_digits: data.user_digits,
          contacts: contacts,
          device_os: Platform.OS,
        }
          
        let axios_config = {
          method: 'POST',
          url: API_URL_PORT+'/set_user_relations',
          data: dataPost,
          headers: {
              "content-type": "application/json",
          }
        }
        const response = await axios(axios_config)
        console.log(response, 'aca axios 2')
        console.log(response, 'RES104')
        if(response.status == 200 && response.data !== "No relations to add") {
          result = true;
          let axios_config = {
            method: 'GET',
            url: API_URL_PORT+'/user_chats?mainView='+mainView,
            headers: {
                "content-type": "application/json", 
                "authorization": 'Bearer ' + token
            }
          }
          
          const response = await axios(axios_config)
          
            if(response.status == 200) {
                if(response.data.user_data) {
                  // return {
                  //   user_data: response.data.user_data,
                  //   user_id: response.data.user_id,
                  //   chats: response.data.data,
                  // }
                  
                  this.setState( {
                    user_data: response.data.user_data,
                    user_id: response.data.user_id,
                    chats: response.data.data,
                  })
                  
                  this._storeChats(this.state);
                }
              } else {
              //handle state
              console.log('network error')
            }  
        } else {
          console.log(this.state, '');
          //MANEJAR SITIACION. VER BACKEND! TODO
          //cuando no encuentra rel to add, utiliza el storage que tenia el celu. 
          //Pueden quedar guardados contactos cuando no existe esa relacion
          //this.setState({chats: []})
          this._storeChats(this.state);
        } 
      })      
    }
  }
  
  async asyncCall() {
    const result = await this.getUserChats();
    this.setState({loadingContacts: false})
  }

  static navigationOptions = ({ navigation }) => {
    console.log(navigation)
    
    return {
      headerRight: ()=>(
        null
      ),
      //tabBarVisible: false,
      tabBarIcon:({tintColor})=>(
        <Icon name="ios-chatboxes" color={tintColor} size={24} />
      ),
      
      title: 'Add chat',
      headerTintColor: "black",
    };
  };

  keyExtractor = (item, index) => item.id.toString();

  addUserToMainView = (params) => {
    AsyncStorage.getItem('id_token').then((token) => {
      console.log(params);
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
          let paramsToChat = 
          {
            user_id: this.state.user_data.id,
            receiver: params.receiver,
            itemData: params.rec_data,
            writer: this.state.user_data,
            fromAdd: true
          }
          //Actions.replace('messages', params.rec_data  );
          GoTo('messages', paramsToChat, 'navigate')
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
    //console.log(item, 'aca user to add')
    //receiver: item.contact_id, user_id, rel_id: item.id
    return (
      <TouchableOpacity
        ref={component => this._touchable = component}
        onPress={() => {
          console.log(item, 'ITEM')
          let params = 
            {
              user_id: this.state.user_id,
              receiver: item.id,
              rec_data: item,
              from_add_chat_view: true
            }
            console.log(this.props.name)
            this.addUserToMainView(params);
        }}
      >
        <ListItem avatar>
              <Left>
                <Thumbnail source={{ uri: 'https://i0.wp.com/wipy.tv/wp-content/uploads/2019/10/Nueva-imagen-de-Avatar-2.jpg?w=1000&ssl=1' }} />
              </Left>
              <Body>
                <Text >{item.firstName + ' ' + item.lastName}</Text>
                <Text note>{item.lastMessage[0] ? item.lastMessage[0][0] : 'Start the chat'}</Text>
              </Body>
              <Right>
                <Text note>{item.lastMessage[0] ? item.lastMessage[0][1] : null}</Text>
              </Right>
        </ListItem>
      </TouchableOpacity>
    );
  }

  drawList = () => {
    return (      
      <View style={{flex: 1}}>
        <FlatList
          data={this.state.chats}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
        />
        
      </View>                            
    );
  }

  render() {
    return(
      this.drawList()
    );
  }
      

  async componentDidMount() {
    await this.asyncCall(); 
    await this._setState();
    
  }
  
  componentWillUnmount(){
    //this.props.destroyParent()
    //this.props.onBack()
  }
}
  
export default AddChatView;