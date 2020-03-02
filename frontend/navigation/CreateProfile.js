import React from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, ScrollView, Alert, TextInput, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { API_URL_PORT } from '../constants/Config'
import GoTo from '../constants/navigate';
import { Container, Text as Txt, Button } from 'native-base';

class CreateProfile extends React.Component {
  
  constructor(props){
    
    super(props);
    this.state = {
        name: '',
        lastname: '',
        email:'',
        prefix: '+49',
        localCode: '157',
        tel: '33921251',
        user: '',
    }
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
            user: response.data,
          }
        )
      })
      .catch((error) => {
        // handle error
        //Alert.alert('error getting user data')
        //console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }

  saveTokenAndGo = async (item, value) => {
    try {
      await AsyncStorage.setItem(item, value);
      GoTo('messages', null, 'navigate')
    } catch (error) {
      console.log(error)
    }
  };

  _createProfile = () => {
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/create_profile',
      data: this.state,
      headers: {
          "content-type": "application/json",
      }
    }
    axios(axios_config)
    .then((response) => {
        this.saveTokenAndGo('step', '5')
        
      })
      .catch((error) => {
        // handle error
        Alert.alert('error on /create_profile!');
        console.log(error);
        
      })
      .finally(function () {
        // always executed
      });
  }

  render() {
    return (
      <Container style={styles.mtContainer}>
        <ScrollView style={styles.content}>
          <KeyboardAvoidingView
            behavior="position"
            style={styles.content}
          >
            <Text style={styles.mainText}>
              Profile
            </Text>
            <Text style={styles.lightText}>
              complete with your data
            </Text>

            <TextInput
                //ref={ref_input1}
                returnKeyType="next"
                //onSubmitEditing={() => ref_input2.current.focus()}
                style={styles.item}
                value={this.state.name}
                onChangeText={e => this.setState({ name: e })}
                underlineColorAndroid="transparent"
                placeholder="name"
                placeholderTextColor='#CCC'
            />

            <TextInput
                //ref={ref_input1}
                returnKeyType="next"
                //onSubmitEditing={() => ref_input2.current.focus()}
                style={styles.item}
                value={this.state.lastname}
                onChangeText={e => this.setState({ lastname: e })}
                underlineColorAndroid="transparent"
                placeholder="Last name"
                placeholderTextColor='#CCC'
            />
          
            <TextInput
                //ref={ref_input2}
                returnKeyType="next"     
                style={styles.item}
                type='text'
                value={this.state.email}
                onChangeText={e => this.setState({ email: e })}
                underlineColorAndroid="transparent"
                placeholder="Email"
                placeholderTextColor='#CCC'
            />
            <Button info style={styles.mtBtn}
                onPress={() => {
                    this._createProfile();
                }}>
                  <Txt>Continue</Txt>
            </Button>
          </KeyboardAvoidingView>
        </ScrollView>
      </Container>
    );
  }

    componentDidMount(){
      AsyncStorage.getItem('id_token').then((token) => {
        this.getUser(token);
      })
    }
  }

  const styles = StyleSheet.create({
 
    mtContainer: {
      paddingTop: 30
    },
    mtBtn: {
      marginTop: 35,
    },
    content: {
      width: '85%',
      marginLeft: '7.5%'
    },
    mainText: {
      textAlign: 'center',
      fontWeight: '200',
      marginTop: 15,
      fontSize: 42
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
  

export default CreateProfile;