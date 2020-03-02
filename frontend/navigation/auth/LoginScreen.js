import React from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Content, Form, Item, Input, Button, Text as Txt } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { API_URL_PORT } from '../../constants/Config'
import SignupScreen from './SignupScreen';
import { ScrollView } from 'react-native-gesture-handler';
import { Actions } from 'react-native-router-flux';
import GoTo from '../../constants/navigate';
class LoginScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
        email: '',
        pass: '',
        isFetching: true
    }
  }

  async saveItem(item, selectedValue) {
    try {
      await AsyncStorage.setItem(item, selectedValue);
    } catch (error) {
      console.error('AsyncStorage error: ' + error.message);
    }
  }
  
  //TODO TEST GETUSERCHATS
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
        Alert.alert('Login Success!');
        this.saveItem('id_token', response.data.accessToken)
        Actions.messages();
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


  // static navigationOptions = ({ navigation, navigationOptions }) => {
  //   const { params } = navigation.state;
  //   console.log(navigationOptions);
  //   return {
  //     headerLeft: () => null,
  //     tabBarVisible: false,
  //     title: ' ',
  //     /* These values are used instead of the shared configuration! */
  //     headerStyle: {
  //       backgroundColor: 'white',
  //       height: 0,
  //     },
  //     headerTintColor: "black",
  //   };
  // };
  
    render() {
      
      const ref_input1 = React.createRef();
      const ref_input2 = React.createRef();

      return (
        <Container style={styles.mtContainer}>
          <ScrollView style={styles.content}>
          <Text style={styles.mainText}>
            Welcome
          </Text>
          <Text style={styles.lightText}>
            Sign in to continue
          </Text>
              
                
                  <TextInput
                      ref={ref_input1}
                      returnKeyType="next"
                      onSubmitEditing={() => ref_input2.current.focus()}
                      style={styles.item}
                      value={this.state.email}
                      onChangeText={e => this.setState({ email: e })}
                      underlineColorAndroid="transparent"
                      placeholder="Email"
                      placeholderTextColor='#CCC'
                  />
                
                  <TextInput
                      ref={ref_input2}
                      returnKeyType="next"     
                      style={styles.item}
                      type='password'
                      value={this.state.pass}
                      onChangeText={e => this.setState({ pass: e })}
                      underlineColorAndroid="transparent"
                      placeholder="Password"
                      placeholderTextColor='#CCC'
                  />
                
              

              <Button transparent
                  onPress={() => {
                      //
                  }}>
                    <Txt style={{marginLeft: 0}}>Forgot password?</Txt>
              </Button>

              <Button info style={styles.mtBtn}
                  onPress={() => {
                      this.login();
                  }}>
                    <Txt>Login</Txt>
              </Button>

              <Button 
                bordered 
                style={{marginTop: 30}}
                onPress={() => {
                  GoTo('signup')  
                }}
              >
                <Txt>Sign up!</Txt>
              </Button>
          </ScrollView>
        </Container>
      );
    }

    componentDidMount(){
      //this.getUserChats(this.state.user_id);
    }
  }

const styles = StyleSheet.create({
 
  mtContainer: {
    paddingTop: 30
  },
  mtBtn: {
    marginTop: 5,
  },
  content: {
    width: '85%',
    marginLeft: '7.5%'
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
    marginTop: 40,
    borderBottomColor: '#BBB',
    borderBottomWidth: 0.5
  },
})
  

export default LoginScreen;