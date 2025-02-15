/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    BackHandler,
    Platform,
    TouchableOpacity,
    Image,
    ScrollView,
    View,
    Alert
} from 'react-native';
import TextInputConpt from '../common/TextInputConpt';
import Toast, {DURATION} from 'react-native-easy-toast';
import VrfFields from '../util/VrfFieldsUtil';
import FetchUtil from '../util/FetchUtil';
import ModalConpt from '../common/ModalConpt';
import Overlay from '../common/Overlay';
import Header from '../common/Header';
import DataUtil from '../util/DataUtil';
import TabPage from '../homePage/TabPage';

const dismissKeyboard = require('dismissKeyboard');

let interval, interval2;

export default class ModifyPwd extends Component {
    constructor(props) {
        super(props);
        this.state = {
            timeRemaining: 60,
            phoneNumber: props.phoneNumber,
            vrfCode: '',
            newPassWord: '',
            confirmPassWord: '',
            succModalVisible: false,
            overlayVisible: false
        };
    }

    componentWillMount() {
        this._countDownAction();
    }

    componentWillUnmount() {
        clearInterval(interval);
        clearInterval(interval2);
    }

    _getVrfCode() {

        if (!this.state.timeRemaining) {
            this.setState({
                timeRemaining: 60
            });
            this._getVrfCodeFromServer();
            this._countDownAction();
        }
    }

    _getVrfCodeFromServer() {
        const options = {
            "url": '8090/sports-meetup-user/users/getVerificationCode',
            "params": {
                "phoneNumber": this.state.phoneNumber,
                "action": 1
            }
        };

        FetchUtil.get(options).then((res) => {

        }).catch((error) => {
            Alert.alert(
                error.code,
                error.message,
                [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ],
                {cancelable: false}
            );

            this.setState({
                timeRemaining: 0,
            });
            interval && clearInterval(interval);
        })
    }

    _countDownAction() {
        let leftTimerCount = this.state.timeRemaining;
        interval = setInterval(() => {
            leftTimerCount = this.state.timeRemaining - 1;
            if (leftTimerCount === 0) {
                this.setState({
                    timeRemaining: leftTimerCount,
                });
                interval && clearInterval(interval);
            } else {
                this.setState({
                    timeRemaining: leftTimerCount,
                });
            }
        }, 1000)
    }

    _countDownAction() {
        let leftTimerCount = this.state.timeRemaining;
        interval = setInterval(() => {
            leftTimerCount = this.state.timeRemaining - 1;
            if (leftTimerCount === 0) {
                this.setState({
                    timeRemaining: leftTimerCount,
                });
                interval && clearInterval(interval);
            } else {
                this.setState({
                    timeRemaining: leftTimerCount,
                });
            }
        }, 1000)
    }

    formatPhone(phone) {
        return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
    }

    _submitNewPassword() {
        dismissKeyboard();
        let fieldArray = [{
            'name': 'vrfCode',
            'isRequired': true,
            'isRegular': true,
            'requiredMsg': '请输入验证码',
            'regularMsg': '请输入6位数字的验证码',
            'value': this.state.vrfCode
        }, {
            'name': 'passWord',
            'isRequired': true,
            'isRegular': true,
            'requiredMsg': '请输入新密码',
            'regularMsg': '请输入6到12位的密码',
            'value': this.state.newPassWord
        }, {
            'name': 'passWord',
            'isRequired': true,
            'isRegular': true,
            'requiredMsg': '请确认新密码',
            'regularMsg': '请输入6到12位的密码',
            'value': this.state.confirmPassWord
        }];

        let errorMsg = VrfFields(fieldArray);
        if (!errorMsg) {
            if (this.state.newPassWord !== this.state.confirmPassWord) {
                errorMsg = "两次密码不一致";
            }
        }

        if (errorMsg) {
            this.refs.toast.show(errorMsg, 500);
        } else {
            this._submitPwdData();
        }
    }

    _submitPwdData() {
        const options = {
            "url": '8888/sports-meetup/users/updatePassword',
            "params": {
                "phoneNumber": this.state.phoneNumber,
                "verificationCode": this.state.vrfCode,
                "password": this.state.newPassWord
            },
            "schema": "addUser"
        };

        this.setState({
            overlayVisible: true,
        });

        FetchUtil.post(options, "PUT").then((res) => {
            this.setState({
                succModalVisible: true,
                overlayVisible: false
            });

            DataUtil.saveData('userLogonInfo', {
                "phoneNumber": this.state.phoneNumber,
                "password": this.state.newPassWord
            });

            interval2 = setInterval(() => {
                interval2 && clearInterval(interval2);
                this._goToHomePage();
            }, 1000)
        }).catch((error) => {
            this.setState({
                overlayVisible: false,
            });
            Alert.alert(
                error.code,
                error.message,
                [
                    {text: 'OK', onPress: () => console.log('OK Pressed')},
                ],
                {cancelable: false}
            );
        })

    }

    _goToHomePage() {
        const {navigator} = this.props;
        if (navigator) {
            navigator.resetTo({
                component: TabPage,
                name: 'TabPageComponent',
                params: {
                    "phoneNumber": this.state.phoneNumber
                }
            });
        }
    }

    render() {
        const succModal = <View style={styles.succModalMainCont}>
            <View style={styles.succModalCont}>
                <Image style={styles.succModalImage}
                       source={require('../../res/images/success.png')}/>
                <Text style={styles.succModalText}>密码修改成功</Text>
            </View>
        </View>;

        return (
            <View style={styles.container}>
                <Header navigator={this.props.navigator} hiddenRightBtn={true}/>
                <View style={styles.mainCont}>
                    <ScrollView
                        ref={(scrollView) => {
                            _scrollView = scrollView;
                        }}
                        automaticallyAdjustContentInsets={false}
                        horizontal={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.phoneInfoMainCont}>
                            <View style={styles.phoneInfoCont}>
                                <View style={styles.phoneInfoRowCont}>
                                    <Text style={styles.phoneInfoText}>已向手机号</Text>
                                    <Text style={styles.phoneNumText}>{this.formatPhone(this.state.phoneNumber)}</Text>
                                    <Text style={styles.phoneInfoText}>发送验证码</Text>
                                </View>
                                <View style={styles.phoneInfoRowCont}>
                                    <Text style={styles.phoneInfoText}>请注意查收</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.getVrfCodeCont}>
                            <TextInputConpt
                                labelCont='验证码'
                                placeholder='请输入验证码'
                                isPassword={false}
                                isShowClear={true}
                                keyboardType="numeric"
                                onChange={(value) => {
                                    this.setState({
                                        vrfCode: value
                                    })
                                }}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    this._getVrfCode()
                                }}
                            >
                                <View
                                    style={[styles.getVrfCodeBtn, this.state.timeRemaining ? {backgroundColor: '#e7e6e6'} : {backgroundColor: '#df3939'}]}>
                                    <Text style={[this.state.timeRemaining ? {color: '#000000'} : {color: '#ffffff'}, {
                                        paddingLeft: 5,
                                        paddingRight: 5
                                    }]}>
                                        {this.state.timeRemaining ? '(' + this.state.timeRemaining + 's)后再次发送' : '获取验证码'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <TextInputConpt
                            labelCont='新密码'
                            placeholder='请输入新密码'
                            isPassword={true}
                            onChange={(value) => {
                                this.setState({
                                    newPassWord: value
                                })
                            }}
                        />
                        <TextInputConpt
                            labelCont='确认密码'
                            placeholder='请输入新密码'
                            isPassword={true}
                            onChange={(value) => {
                                this.setState({
                                    confirmPassWord: value
                                })
                            }}
                        />
                        <View style={styles.submitBtnCont}>
                            <TouchableOpacity
                                onPress={() => {
                                    this._submitNewPassword();
                                }}
                                style={styles.submitButton}
                            >
                                <Text style={styles.submitText}>下一步</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </View>
                <Toast ref="toast" position='center' style={styles.toastStyle}/>
                <ModalConpt
                    allowClose={false}
                    modalCont={succModal}
                    modalVisible={this.state.succModalVisible}
                ></ModalConpt>
                <Overlay
                    allowClose={false}
                    modalVisible={this.state.overlayVisible}
                ></Overlay>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: (Platform.OS === 'ios') ? 20 : 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        backgroundColor: '#272727',
        paddingLeft: 15,
        paddingRight: 15
    },
    headerText: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightBtnText: {
        color: '#E8E8E8',
        fontSize: 15
    },
    mainCont: {
        flex: 1,
        flexDirection: 'row'
    },
    phoneInfoMainCont: {
        height: 122,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
    },
    phoneInfoCont: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    phoneInfoRowCont: {
        flexDirection: 'row'
    },
    phoneInfoText: {
        fontSize: 14,
        color: '#777777'
    },
    phoneNumText: {
        fontSize: 14,
        color: '#393939',
        marginLeft: 5,
        marginRight: 5
    },
    getVrfCodeCont: {
        flex: 1,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f1f1',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 15
    },
    getVrfCodeBtn: {
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5
    },
    submitBtnCont: {
        flexDirection: 'row',
        marginTop: 27,
        paddingLeft: 15,
        paddingRight: 15,
        marginBottom: 15
    },
    submitButton: {
        backgroundColor: '#df3939',
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        borderRadius: 5
    },
    submitText: {
        color: '#ffffff',
        fontSize: 17
    },
    declTextCont: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    declText: {
        color: '#393939',
        fontSize: 11
    },
    declTextLink: {
        color: '#0000FF',
        fontSize: 11
    },
    succModalMainCont: {
        marginLeft: 55,
        marginRight: 55,
        flexDirection: 'row'
    },
    succModalCont: {
        height: 73,
        borderRadius: 5,
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    succModalImage: {
        height: 25,
        width: 25,
        marginRight: 25
    },
    succModalText: {
        fontSize: 17,
        color: '#000000'
    },
    toastStyle: {
        paddingLeft: 15,
        paddingRight: 15
    }
});
