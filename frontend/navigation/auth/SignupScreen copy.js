import React, { useEffect } from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, ListView, ScrollView, SafeAreaView, KeyboardAvoidingView, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Container, Content, Form, Item, Input, Button, Text as Txt } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import { WS_HOST, WS_PORT, API_URL_PORT } from '../../constants/Config'
import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';

class SignupScreen extends React.Component {

  constructor(props){
    super(props);
    this.state = {
        hasPermission: false,
        name: '',
        surname: '',
        email: '',
        pass: '',
        userContacts: '',
        tel:'',
    }
    Contacts.requestPermissionsAsync()
      .then((res) => {
        if(res.status == 'granted') {
          this.setState({hasPermission: true})
          Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
          })
          .then((data) => {
            console.log(data)
          });
        } 
      }).catch((err) => {
        Alert.alert('An error occured')
      });
  }
  
  //TODO TEST GETUSERCHATS
  createUser = () => {
    let axios_config = {
      method: 'POST',
      url: API_URL_PORT+'/signup',
      data: this.state,
      headers: {
          "content-type": "application/json",
      }
    }
    //console.log(axios_config);
    axios(axios_config)
    .then((response) => {
        // handle success
        // this.setState(
        //   {
        //     chats: response.data,
        //     isFetching: false
        //   }
        // );
        console.log(response);
        this.props.navigation.navigate('Login');
      })
      .catch((error) => {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }

  scrollBottom() {
    console.log(this.refs.scrollView); // will scroll to the top at y-position 0
    this.refs.scrollView.scrollToEnd();
  }
  
    render() {
      const ref_input2 = React.createRef();
      const ref_input3 = React.createRef();
      const ref_input4 = React.createRef();
      return (
        

        <SafeAreaView style={styles.container}>
          <View style={this.state.hasPermission ? styles.hide : null}> 
            <View style={styles.container2}>
            <Text style={styles.logo}>We need your permissions on contacts</Text>
            <Text style={styles.logoSmall}>Go to settings > ourAppName and switch on in Contacts</Text>
            </View>
          </View>
          <View style={this.state.hasPermission ? null : styles.hide}>              
            <Text style={styles.logo}>Create account</Text>
            
            <KeyboardAwareScrollView
              resetScrollToCoords={{ x: 0, y: 50 }}
              contentContainerStyle={styles.content}
              scrollEnabled={true} 
            >
              <TextInput
                  returnKeyType="next"
                  onSubmitEditing={() => ref_input2.current.focus()}
                  style={styles.item}
                  value={this.state.name}
                  onChangeText={e => this.setState({ name: e })}
                  underlineColorAndroid="transparent"
                  placeholder="Name"
              />
              <TextInput
                  style={styles.item}
                  value={this.state.surname}
                  onChangeText={e => this.setState({ surname: e })}
                  underlineColorAndroid="transparent"
                  placeholder="Surname"
                  returnKeyType="next"
                  onSubmitEditing={() => ref_input3.current.focus()}
                  ref={ref_input2}
              />
              <TextInput
                  style={styles.item}
                  value={this.state.email}
                  onChangeText={e => this.setState({ email: e })}
                  underlineColorAndroid="transparent"
                  placeholder="Email"
                  returnKeyType="next"
                  onSubmitEditing={() => ref_input4.current.focus()}
                  ref={ref_input3}
              />
              <TextInput
                  style={styles.lastItem}
                  type='password'
                  value={this.state.pass}
                  onChangeText={e => this.setState({ pass: e })}
                  underlineColorAndroid="transparent"
                  placeholder="Password" 
                  ref={ref_input4}
              />  
              <Button bordered
                onPress={() => {
                    this.createUser();
                }}>
                <Txt>Go!</Txt>
              </Button>
          </KeyboardAwareScrollView>
        </View>
      </SafeAreaView>
        
      );
    }


    componentDidMount(){      
           
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // justifyContent: 'center',
      // alignItems: 'center'
    },
    container2: {
      marginTop: 100,
      justifyContent: 'center',
      alignItems: 'center'
    },
    mtContainer: {
      flex: 1,
    },
    mtBtn: {
      marginTop: 5,
    },
    content: {
      marginTop: 20,
      width: '85%',
      marginLeft: '7.5%',
      
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
      marginTop: 20,
      height: 30,
      borderBottomColor: '#BBB',
      borderBottomWidth: 0.5
    },
    lastItem: {
      marginTop: 20,
      marginBottom: 20,
      height: 30,
      borderBottomColor: '#BBB',
      borderBottomWidth: 0.5
    },
    hide: {
      display: 'none'
    },
    logo: {
      textAlign: 'center',
      marginHorizontal: 20,
      fontWeight: '200',
      fontSize: 42,
    },
    logoSmall: {
      textAlign: 'center',
      marginHorizontal: 20,
      fontWeight: '200',
      fontSize: 24,
    }
  })
  
export default SignupScreen;

