import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import { Router, Scene, Tabs, ActionConst, Actions, Stack } from 'react-native-router-flux';
import MensajesScreen from './navigation/MensajesScreen';
import ConfigScreen from './navigation/ConfigScreen';
import TheChat from './navigation/TheChat';
import NotifTest from './navigation/NotifTest';
import SignupScreen from './navigation/auth/SignupScreen';
import CheckScreen from './navigation/CheckScreen';
import CreateProfile from './navigation/CreateProfile';
import { Icon } from 'react-native-elements'


import AddChatView from './components/AddChatView'
import { Button, Alert, TouchableOpacity, View } from 'react-native';
import GoTo from './constants/navigate';
StatusBar.setBarStyle('dark-content', true);

class App extends Component {

  constructor(props){
    super(props);
    //console.log(Cellular.allowsVoip)
  }

  disc = () => {
    return (
      <Icon 
        name='directions' 
        size={18}
      />
    );
  }

  chat = () => {
    return (
      <Button onPress={() => {
        GoTo('messages2')
          Alert.alert('pressed')
         }
        }
      >
        <Icon 
        name='directions' 
        size={18}
      />
      </Button>
      
    );
  }

  settings = () => {
    return (
      <Icon 
        name='directions' 
        size={18}
      />
    )
  }

  componentDidMount() {
    
  }
  
  render() {
    return (
      <Router>
        <Scene key='root' hideNavBar panHandlers={null} type={ActionConst.RESET}>
          <Scene key='check' initial={true} component={CheckScreen} hideNavBar />
          <Scene key='chat' component={TheChat} hideNavBar={false} navigationBarStyle={{ backgroundColor: '#f6f6f6'}}/>
          <Scene key='new_chat' reset={false} component={AddChatView} hideNavBar={false} title='Add chat'/>
          <Scene key='signup' component={SignupScreen} hideNavBar={true} title='' />
          <Scene key='create_profile' component={CreateProfile} hideNavBar={true} title='Profile' gestureEnabled={false}/>
          <Tabs
            key='TabBar'
            //tabBarComponent={CustomTab}
            tabBarStyle={{backgroundColor: '#f6f6f6'}}            
          >
            {/* <Scene key='setting' icon={this.disc} component={ConfigScreen} hideNavBar={false} title='Status'/> */}
            <Scene 
              key='messages' 
              icon={this.chat} 
              component={MensajesScreen} 
              hideNavBar={false} 
              title='Chats'
              backToInitial={true}
            />
            <Scene key='status' icon={this.settings} component={ConfigScreen} hideNavBar={false} title='Settings'/>
            <Scene key='notif' icon={this.settings} component={NotifTest} hideNavBar={false} title='Notiftest'/>
          </Tabs>
        </Scene>
      </Router>
    )
  }
}

export default App