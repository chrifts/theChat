const path = require('path')
var envi = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
console.log(envi);
var models = require('./database/models');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken')
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const Nexmo = require('nexmo');

//app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '1000mb',parameterLimit: 100000,extended: true  }));
app.use(bodyParser.json({ limit: '1000mb'}))


const wss = new WebSocket.Server({port: 3030 });

let channels = [];

wss.on('connection', (ws, req) => {

    //req es el new websocket del front, igual que el ws
    //console.log(req, 'ACA REQ WS');
        
    if(!channels[req.url]) {
        channels[req.url] = [];
        
        channels[req.url].push(ws);    
    } else {

        channels[req.url].push(ws);

    }
    console.log(channels);

    ws.on('message', function incoming(message) {
        if(channels[req.url]) {
            channels[req.url].forEach(function each(client) {
                console.log(client);
                //client is a WebSocket
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    ws.on('close', function (message) {
        //ws.protocol es el cliente que esta haciendo el request
        console.log(req.url, '/user_main/'+ws.protocol, 'AKA TEST')
        
        if(req.url.includes('user_main')) {
            console.log('includes user main')
            //ws.protocol se quiere salir de req.url main
            if(req.url !== '/user_main/'+ws.protocol) {
                console.log('entro a url !== a ws.protocol')
                if(channels[req.url]){
                    channels[req.url].forEach(function each(client, ix) {
                        console.log(client, ix, ws)
                        if(client.protocol == ws.protocol) {
                            delete channels[req.url][ix];
                            //CHECK EMPTY ARRAY
                            console.log('channel to delete ' + req.url)
                            if(channels[req.url].length == 0) {
                                delete channels[req.url] 
                            }
                        }
                    });
                }
            } else {
                delete channels[req.url] 
            }
        } else {
            channels[req.url].forEach(function each(client, ix) {
                console.log(client, ix, ws)
                if(client.protocol == ws.protocol) {
                    delete channels[req.url][ix];
                    //CHECK EMPTY ARRAY
                    console.log('channel to delete ' + req.url)
                    if(channels[req.url].length == 0) {
                        delete channels[req.url] 
                    }
                }
            });
        }
        console.log(channels);
    });
});

function authToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) {
        return res.sendStatus(401)
    }
    jwt.verify(token, envi.parsed.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.sendStatus(403)
        } 
        req.user = user
        next();
    })
}

app.post('/login', function (req, res) {
    const prefix = '+' + req.body.telPrefix;
    const tel = req.body.tel;
    
    let User = models.User;
    console.log(envi.parsed.ACCESS_TOKEN_SECRET, 'ACA TOKEN');
    User.findOne({
        where: {
          prefix: prefix,
          tel: tel,
          verifyCode: 'success'
        }
      }).then((user) => {
            const accessToken = jwt.sign(user.dataValues, envi.parsed.ACCESS_TOKEN_SECRET)
            res.json({accessToken: accessToken});
            //console.log(user.dataValues.password);
            // bcrypt.compare(req.body.pass, user.dataValues.password, function(error, passed) {
            //     if(error) return res.status(403).send(error);
            //     if(passed) {
            //     // Passwords match
            //         //const accessToken = jwt.sign(user.dataValues, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'})
                    // const accessToken = jwt.sign(user.dataValues, process.env.ACCESS_TOKEN_SECRET)
            //         res.json({accessToken: accessToken});
            //     } else {
            //     // Passwords don't match
            //         res.status(400).send({error: 'invalid credential'});
            //     } 
            // });
      }).catch((error) => {
            res.status(400).send({error: 'invalid credential'});
      });
});


app.post('/add_user_to_main_view', authToken, function (req, res) {
    models.Relation.update(
        { 
            onMainView: '1' 
        }, 
        {
            where: {
                user_id: req.body.user_id,
                contact_id: req.body.receiver
            }
        })
        .then(response => {
            res.status(200).send(response)
        })
        .catch(error => {
            res.status(400).send(error)
        })
});

app.get('/user_chats', authToken, async function (req, res) {
    
    let Relations = models.Relation;
    let User = models.User;
    let user_id = req.user.id
    let theUser = await User.findOne({where: user_id});
    let user_data = theUser.dataValues;
    let onMainView = req.query.mainView == 'true' ? true : false;
    
    const rel_chats = await Relations.findAll(
        onMainView ? {where: {user_id: user_id, onMainView: '1'}} : {where: {user_id: user_id}}
    )

    if(rel_chats.length > 0) {
        let contacts_id = [];
        rel_chats.forEach((element, i) => {
            contacts_id.push(element.dataValues.contact_id)
        })

        const result = await User.findAll({
            where: { id: contacts_id, verifyCode: "success" }
        })
        
        let Message = models.Message;

        result.forEach((ele, ix) => {
            result[ix].dataValues.lastMessage = []
            result[ix].dataValues.allMessages = []
        })

        result.forEach(async (ele, ix) => {
            let CHN;
            if(req.user.id > ele.dataValues.id) {
                CHN = req.user.id +'-'+ ele.dataValues.id;
            } else {
                CHN = ele.dataValues.id +'-'+ req.user.id;
            }
            
            const messages = await Message.findAll({
                where: {channel: CHN},
                order: [
                    ['createdAt', 'ASC'],
                ]
            });
                
            result[ix].dataValues.allMessages.push(messages);
            if(messages.length > 0) {
                if(ix + 1 == result.length) {
                    result[ix].dataValues.lastMessage.push([messages[messages.length -1].dataValues.message, messages[messages.length -1].dataValues.createdAt])
                    //console.log(result)
                    res.json({
                        user_data: user_data,
                        user_id: user_id,
                        data: result,
                    });
                } else {
                    result[ix].dataValues.lastMessage.push([messages[messages.length -1].dataValues.message, messages[messages.length -1].dataValues.createdAt])
                }
            } else {
                if(ix + 1 == result.length) {
                    res.json({
                        user_data: user_data,
                        user_id: user_id,
                        data: result,
                    });
                }
            }
        })
    } else {
        res.json({
            user_data: user_data,
            user_id: user_id,
            data: null
        });
    }
});

app.post('/read_messages', authToken, async function (req, res) {
    //FIX THIS
    try {
        const updateMsg = await models.Message.update(
            { 
                readed: '1' 
            }, 
            {
                where: {
                    user_receiver: req.body.user_id,
                    user_transmitter: req.body.receiver_id,
                    channel: req.body.channel
                }
            }
        )
        if(updateMsg) {
            res.json({data: updateMsg});
        } else {
            res.json({data: 'nothingtoupdate'});
        }
    } catch (err) {
        res.status(400).send(err)
        throw new Error(err);
    }
})


app.get('/get_chat_messages', authToken, function (req, res) {
    let Messages = models.Message;
    //let date = req.query.since;
    
    Messages.findAll({
        where: {
            channel: req.query.channel
        },
        order: [['createdAt', 'DESC']]
    }).then((rel_chats) => {
        res.json(rel_chats);
    }).catch((error) => {
        res.json(error);
    });
});

app.get('/get_user_data', authToken, function (req, res) {
    res.status(200).send(req.user);
});

app.post('/signup', function (req, res) {
    let User = models.User;
    bcrypt.hash(req.body.pass, 10, function(err, hash) {
        // Store hash in database
        if(err) res.sendStatus(401);
        User.create(
        { 
            firstName: req.body.name, 
            lastName: req.body.surname,
            email: req.body.email,
            password: hash
        })
        .then((user) => res.status(201).send(user))
        .catch((error) => {
            //console.log(error);
            res.status(400).send(error);
        });
    })
});

app.post('/new_message', authToken, function (req, res) {
    let Message = models.Message;
    let data = req.body;
    //console.log(data);
    Message.create(
        { 
            user_transmitter: data.user_transmitter,
            message: data.message,
            user_receiver: data.user_receiver,
            readed: '0',
            channel: data.channel
        })
        .then((message) => res.status(201).send(message))
        .catch((error) => {
            //console.log(error);
            res.status(400).send(error);
        });
});

app.post('/get_receiver_push_token', function(req, res) {
    console.log(req.body)
    let User = models.User;
    User.findOne({
        where: {
            id: req.body.receiver_id,
        }
      })
      .then(response =>{
        res.status(200).send(response)
      })
      .catch(error => {
        res.status(400).send(error)
      })
})

app.post('/sms_verify', function (req, res) {

    let User = models.User;
    const prefix = '+' + req.body.telPrefix;
    const num = req.body.tel;
    const localCode=req.body.localCode;
    const deviceId = req.body.deviceId;
    const verifyCode = Math.floor(100000 + Math.random() * 900000); //random number of six digits 
    //create user if dont exists, or update verifyCode if it exists

    User.findOne({
        where: {
            prefix: prefix,
            localCode: localCode,
            tel: num
        }
      })
      .then((response)=>{
        if(response) {
            let userId = response.dataValues.id    
            User.update(
            { 
                verifyCode: verifyCode, 
            }, 
            {
                where: {
                    prefix: prefix,
                    localCode: localCode,
                    tel: num
                }
            }).then((response)=>{
                //console.log('aca >', response, '< aca')
                if(response) {
                    // const nexmo = new Nexmo({
                    //     apiKey: '',
                    //     apiSecret: '',
                    // });
                
                    const from = 'Nexmo';
                    const to = prefix + localCode + num;
                    const text = 'Hello! your verify code is: ' + verifyCode + ' Thankyou for use our app';
                
                    
                        //nexmo.message.sendSms(from, to, text);
                        res.status(200).send({user_id: userId, verifyCode: verifyCode})
                    
                } else {
                    
                    res.status(400).send('user not found')
                }
            });
            
        } else {
            User.create(
            { 
                firstName: 'undefined',
                lastName: 'undefined',
                email: 'undefined',
                firstTime: '1',
                prefix: prefix,
                localCode: localCode,
                tel: num,
                digits: prefix + localCode + num,
                verifyCode: verifyCode,
                deviceId: deviceId,
                expoPushToken: '',
            })
            .then((response) => {
                
                let userId = response.dataValues.id;
                // const nexmo = new Nexmo({
                //     apiKey: '',
                //     apiSecret: '',
                // });
            
                const from = 'Nexmo';
                const to = prefix + num;
                const text = 'Hello! your verify code is: ' + verifyCode + ' Thankyou for use our app';
            
                
                //nexmo.message.sendSms(from, to, text);
                res.status(200).send({user_id: userId, verifyCode: verifyCode})
                
            })
            .catch((error) => {
                //console.log(error);
                res.status(400).send(error + 'error aca');
            });
        }
      })
      .catch((error)=> {

        console.log(error)
        res.status(400).send(error + 'error aca 2');
      })

    
});

app.post('/validate_sms_code', function (req, res) {
    let User = models.User;
    //console.log(req.body);
    let code = req.body.verifyCode
    let localCode = req.body.localCode
    let prefix = '+' + req.body.telPrefix
    let tel = req.body.tel
    User.findOne({
        where: {
            verifyCode: code,
            prefix: prefix,
            localCode: localCode,
            tel: tel
        }
      })
      .then((response)=>{
        //console.log(response)
        if(response) {
            User.update(
                { 
                    verifyCode: 'success'
                }, 
                {
                    where: {
                        prefix: prefix,
                        localCode: localCode,
                        tel: tel
                    }
                }).then((response)=>{
                    //console.log('aca >', response, '< aca')
                    if(response) {
                        res.status(200).send('verification success')
                    } else {
                        res.status(400).send('user not found')
                    }
                });
            
        } else {
            res.status(400).send('invalid code')
        }
      })
      .catch((error)=> {
        console.log(error)
      })
});

app.post('/create_profile', function (req, res) {
    let User = models.User;
    //console.log(req.body);
    let name = req.body.name
    let lastname = req.body.lastname
    let email = req.body.email

    let prefix = req.body.user.prefix
    let localCode = req.body.user.localCode
    let tel = req.body.user.tel
    console.log(prefix, localCode, tel);
    User.findOne({
        where: {
            prefix: prefix,
            localCode: localCode,
            tel: tel
        }
      })
      .then((response)=>{
        console.log(response)
        if(response) {
            User.update(
                { 
                    firstName: name,
                    lastName: lastname,
                    email: email,
                    firstTime: '0',
                }, 
                {
                    where: {
                        prefix: prefix,
                        localCode: localCode,
                        tel: tel
                    }
                }).then((response)=>{
                    console.log('aca >', response, '< aca')
                    if(response) {
                        res.status(200).send('data updated')
                    } else {
                        res.status(400).send('error 1 in /create_profile')
                    }
                });
            
        } else {
            res.status(400).send('error 2 in /create_profile')
        }
      })
      .catch((error)=> {
        console.log(error)
        res.status(400).send(error)
      })
});

app.post('/check_first_time', function (req, res) {
    let User = models.User;
    let prefix = '+' + req.body.telPrefix
    let localCode = req.body.localCode
    let tel = req.body.tel
    //console.log(req.body, 'ACA CHECK');
    User.findOne({
        where: {
            prefix: prefix,
            localCode: localCode,
            tel: tel,
            firstTime: '1'
        }
      })
      .then((response)=>{
        if(response) {
            res.status(200).send(true)
        } else {
            res.status(200).send(false)
        }
      })
})

app.post('/set_user_relations', function (req, res) {
    let User = models.User;
    let Relation = models.Relation;
    let user_id = req.body.user_id;
    let contacts = req.body.contacts;
    let deviceOs = req.body.device_os;
    let isForUpdate = req.body.isForUpdate;
    let myDigits = isForUpdate ? req.body.user_digits : '+' + req.body.user_digits;
    console.log(req.body);

    const insertContacts = (ids, insertAll = false, _callback) => {
        let done = false;
        ids.forEach((id, idx) => {
            Relation.create({
                user_id: user_id,
                contact_id: insertAll ? id.dataValues.id : id
            })
            .then((success) => {
                Relation.create({
                    user_id: insertAll ? id.dataValues.id : id,
                    contact_id: user_id
                })
                .then((success) => {
                    //console.log(success);
                    done = true;
                })
                .catch((error) => {
                    throw new Error(error);
                })
            })
            .catch((error) => {
                throw new Error(error);
            })

        })
        _callback(done);
        
    }

    let numbers = []

    contacts.forEach((e, i)=> {
        if(e.phoneNumbers) {
            e.phoneNumbers.forEach((el) => {
                if(deviceOs !== 'ios') {
                    if(el.number.replace(/[^+\d]/g, "") != myDigits) {
                        numbers.push(el.number.replace(/[^+\d]/g, ""))
                        
                    }
                } else {
                    if(el.number.replace(/[^+\d]/g, "") != myDigits) {
                        numbers.push(el.number.replace(/[^+\d]/g, ""))
                        
                    }
                }
            })
        }
    });

    User.findAll({
        where: {'digits': numbers, 'verifyCode': 'success'}
    })
    .then((datas)=>{
        //datas son los contactos del movil que coinciden con la columna digits 
        //de usuarios ya creados y verificados en nuestra DB
        //console.log(datas);
        if(datas.length > 0) {
            let user_contact_id = []
            datas.forEach((e, i)=>{
                user_contact_id.push(e.dataValues.id)
            })
            
            Relation.findAll({
                where: {'user_id': user_id, contact_id: user_contact_id},
            })
            .then((data) => {
                //data es la existencia de alguna relacion existente.
                if(data.length == 0) {
                    insertContacts(datas, true, (theReturn)=>{
                        //console.log(theReturn);
                        res.status(200).send('Relations verified 471')
                    })

                    //console.log('0 existing contact. ADD ALL')
                } else {
                    // console.log('Its existing contacts.')
                    let existingContactId = []
                    
                    data.forEach((e, i)=>{
                        existingContactId.push(parseInt(e.dataValues.contact_id))
                    })
                    let contactsToAdd = user_contact_id.filter(function(obj) { return existingContactId.indexOf(obj) == -1; });
                    //console.log(contactsToAdd);
                    if(contactsToAdd.length > 0) {
                        insertContacts(contactsToAdd, false, (theReturn)=>{
                            //console.log(theReturn);
                            res.status(200).send('Relations verified 486')
                        })
                    } else {
                        res.status(200).send('Relations verified 489')
                    }
                }            
            })
        } else {
            res.status(200).send('No relations to add')
        }
    })
    .catch((error)=> {
        console.log(error)
        res.status(400).send(error)
        
    })
})

app.listen(3000, function (data) {
  console.log('Example app listening on port 3000!');
});
