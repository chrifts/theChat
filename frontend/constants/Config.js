import { Platform, Alert } from 'react-native';
//Alert.alert(Platform.OS);
let IP = 'ec2-18-216-40-212.us-east-2.compute.amazonaws.com';
//let IP;
//Platform.OS == 'android' ? IP = '10.0.2.2' : IP = '127.0.0.1';
//let IP = '192.168.178.36'
export const WS_HOST = IP;
export const WS_PORT = '3030';
export const API_URL_PORT = 'http://'+IP+':3000';
