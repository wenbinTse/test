import * as React from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import { ResponseCode, User } from '../../interface';
import UserService from '../user/user-service';
const FormItem = Form.Item;

interface Props extends FormComponentProps {
  callback: (user: User) => void;
}

class AddMeetingManagerForm extends React.Component<Props, {}> {
  public render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline" onSubmit={this.submitHandler}>
        <FormItem>
          {getFieldDecorator('name', {
            rules: [{required: true, message: '请输入姓名'}]
          })(
            <Input prefix={<Icon type="user"/>} placeholder="会议管理员名"/>
          )
          }
        </FormItem>
        <FormItem>
          {getFieldDecorator('email', {
            rules: [{required: true, message: '请输入邮箱'},
            {type: 'email', message: '请输入正确的邮箱地址'}]
          })(
            <Input prefix={<Icon type="mail"/>} placeholder="邮箱"/>
          )
          }
        </FormItem>
        <FormItem>
          {getFieldDecorator('password', {
            rules: [{required: true, message: '请输入密码'}]
          })(
            <Input prefix={<Icon type="lock"/>} placeholder="密码" type="password"/>
          )
          }
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
          >
            添加
          </Button>
        </FormItem>
      </Form>
    );
  }

  private submitHandler = (event: any) => {
    event.preventDefault();
    this.props.form.validateFields((errs: any, values: any) => {
      if (errs) {
        return;
      }
      HttpRequestDelegate.postJson(
        Urls.addMeetingManager,
        values,
        true,
        (data) => {
          if (data.code === ResponseCode.SUCCESS) {
            message.success('添加成功');
            this.props.callback(data.item);
          } else if (data.code === ResponseCode.UNLOGIN) {
            UserService.requireLogin();
          } else if (data.code === ResponseCode.DUPLICATE_KEY) {
            message.warn('该邮箱已被注册');
          } else if (data.code === ResponseCode.ERROR) {
            message.error('请稍后再试');
          }
        }
      );
    });
  }
}

const AddMeetingManager = Form.create()(AddMeetingManagerForm);

export default AddMeetingManager;
