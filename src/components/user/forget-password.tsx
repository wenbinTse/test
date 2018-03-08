import * as React from 'react';
import { browserHistory } from 'react-router';
import { Form, Input, Icon, Col, Row, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode } from '../../interface';
import * as Styles from './user.css';

const FormItem = Form.Item;

interface State {
  sendButtonText: string;
  sending: boolean;
  submitting: boolean;
}

class ForgetPasswordForm extends React.Component<FormComponentProps, State> {
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      sendButtonText: '获取验证码',
      sending: false,
      submitting: false
    };
  }
  public render() {
    const { getFieldDecorator } = this.props.form;
    return(
      <Form className={Styles.form}>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: '请输入邮箱地址' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
          )}
        </FormItem>
        <Row>
          <Col span={12}>
            <FormItem>
              {getFieldDecorator('code', {
                rules: [{ required: true, message: '请输入验证码' }],
              })(
                <Input prefix={<Icon type="code" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="验证码" />
              )}
            </FormItem>
          </Col>
          <Col span={11} offset={1}>
            <FormItem>
              <Button loading={this.state.sending} style={{width: '100%'}} onClick={() => this.sendCodeHandler()}>{this.state.sendButtonText}</Button>
            </FormItem>
          </Col>
        </Row>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入新密码' }],
          })(
            <Input type="password" prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="密码" />
          )}
        </FormItem>
        <Button
          htmlType="submit"
          loading={this.state.submitting}
          style={{width: '100%'}}
          type="primary"
          onClick={this.submitHandler}
        >确定
        </Button>
      </Form>
    );
  }

  private sendCodeHandler = () => {
    this.props.form.validateFields(['email'], (errs, values) => {
      if (!errs) {
        this.setState({sending: true});
        HttpRequestDelegate.get(
          Urls.sendVerificationCode(values.email),
          true,
          (data) => {
            this.setState({sending: false});
            if (data.code === ResponseCode.SUCCESS) {
              message.success('验证码已发送');
              let time = 60;
              const timer = setInterval(
                () => {
                  this.setState({sendButtonText: `已发送(${time}s)`});
                  time--;
                  if (time <= 1) {
                    clearInterval(timer);
                    this.setState({sendButtonText: '获取验证码'});
                  }
                },
                1000
              );
            } else {
              message.warning('稍等再试');
            }
          }
        );
      }
    });
  }

  private submitHandler = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields(((errors, values) => {
      if (!errors) {
        this.setState({submitting: true});
        HttpRequestDelegate.postJson(
          Urls.resetPassword,
          values,
          true,
          (data) => {
            this.setState({submitting: false});
            if (data.code === ResponseCode.SUCCESS) {
              message.success('密码重置成功,3秒后跳转到登录页');
              setTimeout(
                () => browserHistory.push('/login'),
                3000
              );
            } else if (data.code === ResponseCode.INVALID_INPUT) {
              message.warning('验证码不正确');
            } else {
              message.error('请稍后再试');
            }
          }
        );
      }
    }));
  }
}

const ForgetPassword = Form.create()(ForgetPasswordForm);

export = ForgetPassword;
