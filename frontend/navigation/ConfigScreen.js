import React from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Button } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_URL_PORT } from '../constants/Config'
import { Actions } from 'react-native-router-flux';


class ConfigScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
        email: '',
        pass: '',
        isFetching: false
    }
  }

    Logout() {
        try {
            AsyncStorage.removeItem('id_token');
            Alert.alert('Logout Success');
            Actions.signup()
        } catch (error) {
            Alert.alert('Error on logout')
            console.error('AsyncStorage error: ' + error.message);
        }
  }

  // static navigationOptions = ({ navigation, navigationOptions }) => {
  //   const { params } = navigation.state;
    
    
  //   return {
      
  //     title: 'Settings',
  //     /* These values are used instead of the shared configuration! */
  //     headerStyle: {
  //       backgroundColor: 'grey',
  //     },
  //     headerTintColor: "black",
  //   };
  // };
  
    render() {
      return (
        <View>
          <Text>{this.state.isFetching ? 'Cargando...' : ''}</Text>
          {/* {console.log(this.state.chats)} */}

              <View>
                <TouchableOpacity                  
                  onPress={() => {
                      this.Logout();
                  }}>
                    <Icon
                      name="chevron-left"
                      size={30}
                      color="black"
                    />
                    <Text>Logout</Text>
                </TouchableOpacity>
              </View>
        </View>
      );
    }

    componentDidMount(){
      //this.getUserChats(this.state.user_id);
    }
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})
  

export default ConfigScreen;