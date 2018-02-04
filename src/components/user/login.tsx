import * as React from 'react';
import { browserHistory } from 'react-router';
import { Form, Icon, Input, Button, message } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import * as Styles from './user.css';
import {  FormComponentProps } from 'antd/lib/form';
import { ResponseCode } from '../../interface';
import Urls from '../../urls';
import HttpRequestDelegate from '../../http-request-delegate';
import UserService from './user-service';

interface State {
  loading: boolean;
  logging: boolean;
}

interface Props extends FormComponentProps {
  refresh?: boolean;
}

class LoginForm extends React.Component<Props, State> {
  constructor(props: FormComponentProps) {
    super(props);
    this.state = {
      loading: true,
      logging: false
    };
  }
  public render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className={Styles.form}>
        <span>登录</span>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{ required: true, message: '请输入邮箱地址' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="邮箱" />
          )}
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: '请输入密码' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
          )}
        </FormItem>
        <Button type="primary" htmlType="submit" style={{width: '100%'}} loading={this.state.logging}>
          登录
        </Button>
        <div className={Styles.bottomContainer}>
          <span>没有账号? <a onClick={() => UserService.requireSignup()}>注册</a></span>
          <a onClick={() => browserHistory.push('/forgetPassword')}>忘记密码</a>
        </div>
      </Form>
    );
  }
  
  private handleSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields((err: any, values: any) => {
      if (!err) {
        this.setState({logging: true});
        HttpRequestDelegate.postJson(
          Urls.login,
          values,
          true,
          (data) => {
            this.setState({logging: false});
            if (data.code === ResponseCode.SUCCESS) {
              message.success('成功登录');
              setTimeout(
                () => {
                  if (this.props.refresh === false) {
                    return;
                  }
                  if ((/\/login$/i).test(window.location.pathname)) {
                    window.location.href = '/';
                  } else if (window.location.hash === '#login') {
                    window.location.href = window.location.pathname;
                  } else {
                    window.location.reload();
                  }
                },
                1000
              );
            } else if (data.code === ResponseCode.INCORRECT_USERNAME_OR_PASSWORD) {
              message.warning('邮箱或密码错误');
            } else {
              message.error('请稍后再试');
            }
          });
      }
    });
  }
}

const Login = Form.create()(LoginForm);

export = Login;
