const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser')
const url = 'https://passport.psu.ac.th/authentication/authentication.asmx?wsdl';
const app = express()
const router = express.Router()
const Web3 = require("web3");
const fs = require('fs');
const path = require('path');
const web3 = new Web3();
const EthereumTx = require('ethereumjs-tx').Transaction;
const Buffer = require('safer-buffer').Buffer;
const cors = require('cors');
// <!--===============================================================================================-->
app.use(cors());
var engines = require('consolidate');
app.use('/api', router);
app.use('/front', express.static(path.join(__dirname, 'front')));
app.use('/views', express.static(path.join(__dirname, 'views')));
app.set('views', __dirname + '/');
app.engine('html', engines.mustache);
app.set('views engine', 'html');
var Web3EthAccounts = require('web3-eth-accounts');
var firebase = require('firebase')

// app.use(bodyParser.urlencoded({ extended: true }), router)
app.use(bodyParser.json(), router)
//app.use(bodyParser.urlencoded({ extended: false }))
//app.use(bodyParser.json())

app.get('/showdata/confirm', (req, res) => {
    var test = [];
    var leadsRef = database.ref('users');
    leadsRef.on('value', (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            var childData = childSnapshot.val();
            //console.log("childData_formnode===>", childData)
            test.push(childData)
        });
    });
    res.json(test)
    //console.log("test ==>" + test)
    // var test_Show = req.headers
    //var test_Show1 = req.data
    // console.log("test_Show ===>", test1)
})

app.post('/showdata/confirm', (req, res) => {
    const data = req.body
    // const data1 = req.header
    console.log("data", data) //ค่าจาก หน้าบ้านส่งมา หา route นี้
    console.log("data_from_post", data[0].name.GetStaffDetailsResult.string)
    res.send(data)

})

router.route('/test2')
    .post((req, res) => {
        const data = req.body
        console.log("SHOW", data)
        //res.send(data)
    })

//app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
/*app.use(function(req, res, next) {
    console.log(req.body) // populated!
})*/


// <!--===============================================================================================-->
var firebaseConfig = {
    apiKey: "AIzaSyDPwR_Tlxe5MODIEPugWCnO_drEh6-4jjw",
    authDomain: "login-psu-final.firebaseapp.com",
    databaseURL: "https://login-psu-final.firebaseio.com",
    projectId: "login-psu-final",
    storageBucket: "login-psu-final.appspot.com",
    messagingSenderId: "152285332333",
    appId: "1:152285332333:web:bc428892887d5004"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
// <!--===============================================================================================-->
router.route('/Login')
    .post((req, res) => {
        soap.createClient(url, (err, client) => {
            console.log("CONNECT_LOGIN");
            if (err)
                console.error("err", err);
            else {
                console.log("CONNECT_LOGIN11111");
                let user = {}
                user.username = req.body.username //id
                user.password = req.body.password
                console.log("user.username ====", user.username);
                console.log("user.password ==== ", user.password);
                client.GetStaffDetails(user, (err, response) => {
                    if (response.GetStaffDetailsResult.string[0] == "") {
                        //res.redirect('/error')
                        console.error("ID ERROR ............................................");
                    } else {
                        var account = new Web3EthAccounts('ws://kovan.infura.io/v3/37dd526435b74012b996e147cda1c261');
                        var user_eth = account.create();
                        console.log("response........ ", response)
                        database.ref('users').child(user.username).once("value", snapshot => {
                            console.log("Firebase_user.username ", user.username)
                            if (snapshot.exists()) { // check ????????????????????????
                                console.log('already exists', snapshot.exists())
                                // res.send('<script>alert("??????????????????");</script>');
                                // res.redirect('/index/' + user.username)
                                res.send(user.username)
                                return false;
                            } else {
                                console.log('bad bad')
                                database.ref('users').child(user.username).set({
                                    address: user_eth.address,
                                    privateKey: user_eth.privateKey.substring(2).toUpperCase(),
                                    balance: "",
                                    name: response,
                                }).then(() => {
                                    console.log('create new wallet')
                                    // console.log('test_Show',name)
                                    // res.send({ user_eth, response });
                                    //res.redirect('/index/' + user.username)
                                    return false;
                                    // res.redirect("/showdata)                 
                                }).catch(e => {
                                    console.log(e)
                                })
                            }
                        })
                    }
                });
            }
        });
    })
// <!--===============================================================================================-->
router.route('/send/:id')
    .get((req, res) => {
        res.render('tranfer.html')
    })
router.route('/send/:id/confirm')
    .get((req, res) => {
        async function Tranfer() {
            // const id = req.headers.toaddress;


            const id = req.headers.toaddress;
            const fromAddress = req.headers.fromaddress;
            const money = req.headers.money;
            const privateKey = req.headers.privatekey;
            // const testvalue = req.headers.result;

            console.log('xx: ', req.headers)
            console.log("id", id)
            console.log("testvalue === >", req.header.value1)
            console.log("fromAddress =>", fromAddress)
            console.log("money =>", money)
            console.log("privateKey =>", privateKey)


            const toAddress = await getReceiverWalletFromId(id)
            console.log("toAddress_show_toAddress =>", toAddress)
            let toAddress2 = toAddress.val();
            let totalvalue = toAddress2.balance;
            //let toAddress3 = toAddress.val([1].address);


            console.log("toAddress2 =>", toAddress2)
            console.log("totalvalue =>", totalvalue)
            //console.log("toAddress3 =>", toAddress3)
            //console.log("toAddress_show_totalvalue =>" , toAddress)
            // toAddress.(snap => { // ??????????????????????????????
            //     toAddress2 = snap.val().address
            //     console.log("toAddress2 =>", toAddress2)
            // })

            web3.setProvider(new web3.providers.HttpProvider("https://kovan.infura.io/v3/37dd526435b74012b996e147cda1c261"));
            var abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi.json'), 'utf-8'));
            var count = await web3.eth.getTransactionCount(fromAddress);
            var contractAddress = "0x0d01bc6041ac8f72e1e4b831714282f755012764";
            var contract = new web3.eth.Contract(abi, contractAddress, { from: fromAddress });
            var weiTokenAmount = web3.utils.toWei(String(money), 'ether');
            var Transaction = {
                "from": fromAddress,
                "nonce": "0x" + count.toString(16),
                "gasPrice": "0x003B9ACA00",
                "gasLimit": "0x250CA", //151754
                "to": contractAddress,
                "value": "0x0",
                "data": contract.methods.transfer(toAddress2.address, weiTokenAmount).encodeABI(),
                "chainId": 0x03
            };
            var privKey = Buffer.from(privateKey, 'hex');
            console.log("privKey = > ", privKey);
            const tx = new EthereumTx(Transaction, { chain: 'kovan' });
            tx.sign(privKey);
            var serializedTx = tx.serialize();
            console.log("serializedTx =>", serializedTx)
            var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
            console.log("receipt =>", receipt)
            res.json(JSON.stringify(receipt.transactionHash))
            database.ref('users').child(id).once("value", snapshot => {
                if (snapshot.exists()) { // check ????????????????????????
                    console.log('Have_data')
                    database.ref('users').child(id).update({
                        // balance: (req.headers.money+toAddress2.balance),
                        balance: parseInt(req.headers.money) + parseInt(toAddress2.balance)
                    }).then(() => {
                        console.log('push_send_perfect')
                    }).catch(e => {
                        console.log(e)
                    })
                }
            })
            // return receipt
        }
        Tranfer().then((result) => {
            console.log(result)
        })

    })
// <!--===============================================================================================-->


// router.route('/showdata/confirm')
//     .get((req, res) => {

//         var test = [];
//         var leadsRef = database.ref('users');
//         leadsRef.on('value', (snapshot) => {
//             snapshot.forEach((childSnapshot) => {
//                 var childData = childSnapshot.val();
//                console.log("childData_formnode===>", childData)
//                 test.push(childData)
//             });
//         });
//         res.json(test)
//         // var test_Show = req.headers
//         //var test_Show1 = req.data
//         // console.log("test_Show ===>", test1)
//     })
//     .post((req, res)=>{
//         //Restful API
//         var body = req.body;
//         console.log("Body ===>", body)
//     })

/*app.get('/showdata/confirm', (req, res) => {
        var test = [];
        var leadsRef = database.ref('users');
        leadsRef.on('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                var childData = childSnapshot.val();
                console.log("childData_formnode===>", childData)
                test.push(childData)
            });
        });
        res.json(test)
        console.log("test ==>" + test)
        // var test_Show = req.headers
        //var test_Show1 = req.data
        // console.log("test_Show ===>", test1)
    })*/

/*app.post('/showdata/confirm', (req, res) => {
    const data = req.body
    console.log(data)
    res.send(data)
})*/





// <!--===============================================================================================-->
router.route('/showdata_admin/:id/confirm')
    .get((req, res) => {
        //var test = req.headers.id;
        var test = [];
        var leadsRef = database.ref('users');

        leadsRef.on('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                var childData = childSnapshot.val();
                console.log("showdata_admin ===>", childData)
                test.push(childData)
                console.log("test ===>", test) // id , address , balance
            });
        });
        res.json(JSON.stringify(test))
    })

// <!--===============================================================================================-->



router.route('/error')
    .get((req, res) => {
        res.render('error.html')
    })
// <!--===============================================================================================-->
router.route('/test_admin/:id')
    .get((req, res) => {
        res.render('test_admin.html')
    })
// <!--===============================================================================================-->
router.route('/index/:id')
    .get((req, res) => {
        res.render('index.html')
    })
// <!--===============================================================================================-->
router.route('/index/:id/confirm')
    .get((req, res) => { })
// <!--===============================================================================================-->
//profile.html

router.route('/profile/:id')
    .get((req, res) => {
        res.render('profile.html')
    })
// <!--===============================================================================================-->
/*router.route('/balance/:id')
    .get((req, res) => {
        res.render('balance.html')
    })*/
// <!--===============================================================================================-->
router.route('/balance/confirm')
    .post((req, res) => {
        web3.setProvider(new web3.providers.HttpProvider("https://kovan.infura.io/v3/37dd526435b74012b996e147cda1c261"));

        function getERC20TokenBalance(tokenAddress, walletAddress, callback) {
            let minABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './src/abi.json'), 'utf-8'));
            let contract = new web3.eth.Contract(minABI, tokenAddress);
            contract.methods.balanceOf(walletAddress).call((error, balance) => {
                contract.methods.decimals().call((error, decimals) => {
                    balance = balance / (10 ** decimals);
                    console.log("decimals => ", decimals);
                    console.log("balance => ", balance, "PSU");
                    res.json(balance)
                    // res.send(JSON.stringify(balance))
                }).then(() => {
                    console.log('complete_check_balance')
                }).catch(e => {
                    console.log(e)
                });
            });
        }

        function onAddressChange() {

            const walletAddress = req.body.name;
            let tokenAddress = "0x0d01bc6041ac8f72e1e4b831714282f755012764";
            console.log("walletAddress =>", walletAddress)
            if (tokenAddress != "" && walletAddress != "") {
                getERC20TokenBalance(tokenAddress, walletAddress, (balance) => { })
            }
        }
        onAddressChange((resolve, reject) => {
            resolve(balance)
        })
    })
/*app.post('/balance/confirm', (req, res) => {
    web3.setProvider(new web3.providers.HttpProvider("https://kovan.infura.io/v3/37dd526435b74012b996e147cda1c261"));

    function getERC20TokenBalance(tokenAddress, walletAddress, callback) {
        let minABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './src/abi.json'), 'utf-8'));
        let contract = new web3.eth.Contract(minABI, tokenAddress);
        contract.methods.balanceOf(walletAddress).call((error, balance) => {
            contract.methods.decimals().call((error, decimals) => {
                balance = balance / (10 ** decimals);
                console.log("decimals => ", decimals);
                console.log("balance => ", balance, "PSU");
                res.json(JSON.stringify(balance))
                // res.send(JSON.stringify(balance))
            }).then(() => {
                console.log('complete_check_balance')
            }).catch(e => {
                console.log(e)
            });
        });
    }

    function onAddressChange() {
        //console.log("walletAddress =>")
        //const data = req.body
        const walletAddress = req.header.username ;
        let tokenAddress = "0x0d01bc6041ac8f72e1e4b831714282f755012764";
        console.log("walletAddress =>", walletAddress)
        //console.log("tokenAddress =>", tokenAddress)
        if (tokenAddress != "" && walletAddress != "") {
            getERC20TokenBalance(tokenAddress, walletAddress, (balance) => { })
        }
    }
    onAddressChange((resolve, reject) => {
        resolve(balance)
    })
 
})*/
// <!--===============================================================================================-->
router.route('/balance_admin/:id/confirm')
    .post((req, res) => {
        web3.setProvider(new web3.providers.HttpProvider("https://kovan.infura.io/v3/37dd526435b74012b996e147cda1c261"));
        async function getERC20TokenBalance(tokenAddress, walletAddress, string, callback) {
            var minABI = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi.json'), 'utf-8'));
            let contract = new web3.eth.Contract(minABI, tokenAddress);
            let sw;
            contract.methods.balanceOf(walletAddress).call((error, balance) => {
                contract.methods.decimals().call((error, decimals) => {
                    balance = balance / (10 ** decimals);
                    console.log("decimals => ", decimals);
                    console.log("balance => ", balance, "PSU");
                    database.ref('users').child(string).once("value", snapshot => {
                        if (snapshot.exists()) { // check ????????????????????????
                            //console.log('Have_data')
                            database.ref('users').child(string).update({
                                // balance: (req.headers.money+toAddress2.balance),
                                balance: balance,
                            }).then(() => {
                                //res.json(JSON.stringify(balance))

                                console.log('push_perfect')

                                if ('push_perfect') {
                                    console.log('redirect_complete')
                                    res.redirect('/showdata');

                                }


                            }).catch(e => {
                                console.log(e)
                            })
                        }
                    })
                    // res.send(JSON.stringify(balance))
                }).then(() => {
                    console.log('complete_check_balance')
                }).catch(e => {
                    console.log(e)

                });
            });
        }
        async function onAddressChange(e) {
            const string = req.headers.result_test;
            // const string = req.headers.toaddress; // dataform ===> test_admin_textarea
            //const show_req = req.header.id;
            console.log("string", string)
            const walletAddress = string.match(/(\d){10}/gm);
            let tokenAddress = "0x0d01bc6041ac8f72e1e4b831714282f755012764";
            console.log("walletAddress =>", walletAddress)
            console.log("tokenAddress =>", tokenAddress)
            for (let i in walletAddress) {
                let response = await getReceiverWalletFromId(walletAddress[i])
                let wallet = response.val()
                console.log("wallet ===> ", wallet.address)
                if (tokenAddress != "" && wallet.address != "") {
                    getERC20TokenBalance(tokenAddress, wallet.address, string, (balance) => { })
                }
            }
        }

        onAddressChange((resolve, reject) => {
            resolve(balance)
        })

    })

// <!--===============================================================================================-->

router.route('/getWalletById')
    .post((req, res) => {
        const id = req.body.username; //5935512088
        console.log("get", id)
        database.ref('users').child(id).once("value", snapshot => {
            res.json({
                address: snapshot.val().address,
                privateKey: snapshot.val().privateKey,
            },
            )
            // console.log("get", snapshot.val().address)
            // console.log("get", snapshot.val().privateKey)
        })

    })

    // .get((req, res) => {
    //     //const id = req.body.name; //5935512088
    //     console.log("get", id)
    //     database.ref('users').child(id).once("value", snapshot => {
    //         res.json(JSON.stringify({
    //             address: snapshot.val().address,
    //             privateKey: snapshot.val().privateKey,
    //         },
    //         ))
    //         // console.log("get", snapshot.val().address)
    //         // console.log("get", snapshot.val().privateKey)
    //     })

    // })

// <!--===============================================================================================-->
router.route('/sendadmin/:id')
    .get((req, res) => {
        res.render('sendadmin.html')
    })
router.route('/sendadmin/:id/confirm')
    .get((req, res) => {
        async function Tranfer() {
            // const id = req.headers.toaddress;

            const xx = req.headers;
            console.log('xx: ', xx)
            const string = req.headers.toaddress;
            console.log("string = >", string)
            var id = string.match(/(\d){10}/gm)
            console.log("id for text_area ===>", id)
            const fromAddress = req.headers.fromaddress;
            const money = req.headers.money;
            const privateKey = req.headers.privatekey;
            //const testvalue = req.headers.result;
            console.log("testvalue === >", req.header.value1)
            console.log("fromAddress =>", fromAddress)
            console.log("money =>", money)
            console.log("privateKey =>", privateKey)
            //console.log("totalvalue =>", totalvalue)
            web3.setProvider(new web3.providers.HttpProvider("https://kovan.infura.io/v3/37dd526435b74012b996e147cda1c261"));
            var abi = JSON.parse(fs.readFileSync(path.resolve(__dirname, './abi.json'), 'utf-8'));
            var count = await web3.eth.getTransactionCount(fromAddress);
            //var count = await Web3.eth.getTransactionCount(fromAddress,'pending');
            var contractAddress = "0x0d01bc6041ac8f72e1e4b831714282f755012764";
            var contract = new web3.eth.Contract(abi, contractAddress, { from: fromAddress });
            var weiTokenAmount = web3.utils.toWei(String(money), 'ether');
            var privKey = Buffer.from(privateKey, 'hex');

            for (let i in id) {
                let response = await getReceiverWalletFromId(id[i]) //5935512088
                let wallet = response.val()
                var Transaction = {
                    "from": fromAddress,
                    "nonce": "0x" + (count++).toString(16),
                    "gasPrice": "0x003B9ACA00",
                    "gasLimit": "0x250CA", //151754+
                    "to": contractAddress,
                    "value": "0x0",
                    "data": contract.methods.transfer(wallet.address, weiTokenAmount).encodeABI(),
                    "chainId": 0x03
                };
                console.log("privKey = > ", privKey);
                const tx = new EthereumTx(Transaction, { chain: 'kovan' });
                tx.sign(privKey);
                var serializedTx = tx.serialize();
                console.log("serializedTx =>", serializedTx)
                var receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
                console.log("receipt =>", receipt)
                //res.json(JSON.stringify(receipt.transactionHash))
                /*database.ref('users').child(id[i]).once("value", snapshot => {
                    if (snapshot.exists()) { // check ????????????????????????
                        console.log('Have_data')
                        database.ref('users').child(id[i]).update({
                            // balance: (req.headers.money+toAddress2.balance),
                            balance: req.headers.money,
                        }).then(() => {
                            console.log('push_perfect')
                        }).catch(e => {
                            console.log(e)
                        })
                    }
                })*/
                // console.log("finish" + (i + 1))
            }

        }
        Tranfer().then((result) => {
            console.log(result)
        })

    })
// <!--===============================================================================================-->
router.route('/getProfileById')
    .get((req, res) => {
        const id = req.headers.id;
        console.log("id_toaddress", id)
        database.ref('users').child(id).once("value", snapshot => {
            if (snapshot.val()) {
                const data = snapshot.val().name.GetStaffDetailsResult.string
                //console.log("data", data)
                res.send(JSON.stringify({
                    id: data[0],
                    name: data[1],
                    lastName: data[2]
                }))
            } else {
                res.send(JSON.stringify({
                    id: '',
                    name: '',
                    lastName: ''
                }))
            }
        })
    })
// <!--===============================================================================================-->
router.route('/getProfileforbalance') // ??????????????? ??????
    .get((req, res) => {
        const id = req.headers.id; // ???????????? ??????
        console.log("get", id)
        database.ref('users').child(id).once("value", snapshot => {
            if (snapshot.val()) {
                const data = snapshot.val().balance
                res.send(JSON.stringify(data))
            }
            //else {
            // console.log(err)
            // }
        })

    })
// <!--===============================================================================================-->
async function getReceiverWalletFromId(id) {
    console.log("id in getReceiverWalletFromId", id); //id ??? ??????????????? Toaddress ???????????????????
    return await database.ref('users').child(id).once("value")
    // console.log("getReceiverWalletFromId = >",id)
}
// <!--===============================================================================================-->


app.listen(8000, () => console.log('Server is ready!'))


// 791786F6D865B4FAFAC0E92A5961D0526AF0072EFA757D5E46E59A69EF63FF70