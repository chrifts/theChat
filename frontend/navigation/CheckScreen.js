import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Actions } from 'react-native-router-flux';


class CheckScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
        email: '',
        pass: '',
        isFetching: false
    }
    AsyncStorage.getItem('id_token').then((token) => {
      if(token){
        AsyncStorage.getItem('step').then((step) => {
          if(step == '4') {
            Actions.create_profile()
          } else {
            Actions.messages()
          }
        })
      } else {
        Actions.signup()
      }
    })
  }

  
    render() {
      return (
        <View>
              
          <Text style={{marginTop: 0}}>Cargando...</Text>
              
        </View>
      );
    }

    componentDidMount(){
      
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
  

export default CheckScreen;