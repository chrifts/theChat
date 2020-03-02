import React from 'react';
import axios from 'axios';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {API_URL_PORT} from '../constants/Config';

class LogoTitle extends React.Component {
  render() {
    return (
      <View style={{flex:1,justifyContent: "center",alignItems: "center"}}>
          
          <Text 
              style={{color:'white', fontWeight: "bold" }}
          >TheChat!
          </Text>
      </View>
    );
  }
}

class HomeScreen extends React.Component {

    constructor(props){
      super(props);
      this.state = {
        isLogged: this.logged,
      }
      AsyncStorage.getItem('id_token').then((token) => {
        //console.log(token);
        if(this.state.isLogged) {
          this.getUser(token);
        }
      }).catch((error) => {
        console.log(error)
      });
    }

    getUser = (token) => {
      let axios_config = {
        method: 'GET',
        url: API_URL_PORT+'/get_user_data',
        headers: {
            "content-type": "application/json", 
            "authorization": 'Bearer ' + token
        }
      }
      //console.log(axios_config);
      axios(axios_config)
      .then((response) => {
          // handle success
          //Alert.alert('success user data')
          this.setState(
            {
              isLogged: true,
              user: response.data,
            }
          )
          //console.log(response);
        })
        .catch((error) => {
          // handle error
          //Alert.alert('error getting user data')
          console.log(error);
        })
        .finally(function () {
          // always executed
        });
    }

  //   static navigationOptions = ({ navigation }) => {
  //     return {
  //        title: 'Screen Title',
  //        headerTintColor: 'royalblue',
  //        headerStyle: {
  //           backgroundColor: '#fff'
  //        }
  //     }
  //  }

    render() {
      const iconSize = 30;
      const iconColor = 'blue';
      //console.log(this.state);
      return (
          
          <View style={styles.container}>
            <Text>Home</Text>
          </View>
          
      );
    }
    componentDidMount() {
      //
    }
  }

  const styles = StyleSheet.create({
    container: {
      width: "100%",
      //marginHorizontal: 10,
      marginVertical: 10,
      flex: 1,

      flexDirection: 'row',
      flexWrap: "wrap",
      justifyContent: "space-around",
    },
    hide: {
      display: 'none'
    },
    btnCont: {
      width: "48%",
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 1,
    }, 
    btnText: {
      color: "black"
    },
    buttonMain: {
      height: 150,
      backgroundColor: "white",
      shadowColor: "black",
      margin: 4,
    },
    contentContainer: {
      paddingTop: 30,
    },
    welcomeContainer: {
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    welcomeImage: {
      width: 100,
      height: 80,
      resizeMode: 'contain',
      marginTop: 3,
      marginLeft: -10,
    },
    getStartedContainer: {
      alignItems: 'center',
      marginHorizontal: 50,
    },
    homeScreenFilename: {
      marginVertical: 7,
    },
    codeHighlightText: {
      color: 'rgba(96,100,109, 0.8)',
    },
    codeHighlightContainer: {
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 3,
      paddingHorizontal: 4,
    },
    getStartedText: {
      fontSize: 17,
      color: 'rgba(96,100,109, 1)',
      lineHeight: 24,
      textAlign: 'center',
    },
    tabBarInfoContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      ...Platform.select({
        ios: {
          shadowColor: 'black',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        android: {
          elevation: 20,
        },
      }),
      alignItems: 'center',
      backgroundColor: '#fbfbfb',
      paddingVertical: 20,
    },
    tabBarInfoText: {
      fontSize: 17,
      color: 'rgba(96,100,109, 1)',
      textAlign: 'center',
    },
    navigationFilename: {
      marginTop: 5,
    },
    helpContainer: {
      marginTop: 15,
      alignItems: 'center',
    },
    helpLink: {
      paddingVertical: 15,
    },
    helpLinkText: {
      fontSize: 14,
      color: '#2e78b7',
    },
  });
  
  export default HomeScreen;