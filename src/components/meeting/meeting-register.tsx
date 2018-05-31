import * as React from 'react';
import { Form, Radio, Input, Checkbox, Button, message } from 'antd';
import {  FormComponentProps } from 'antd/lib/form';
import * as moment from 'moment';
import Urls from '../../urls';
import HttpRequestDelegate from '../../http-request-delegate';
import { ResponseCode } from '../../interface';
import UserService from '../user/user-service';

const FormItem = Form.Item;

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

interface Props extends FormComponentProps {
  meetingId: string;
  startDate: Date;
  endDate: Date;
  stayTypes: string[];
}

interface State {
  stay: boolean;
}

class MeetingRegisterForm extends React.Component<Props, State> {
  private dates: moment.Moment[] = [];
  private dateOptions: Array<{label: string, value: string}> = [];
  constructor(props: Props) {
    super(props);
    this.state = {
      stay: false
    };

    const startMoment = moment(this.props.startDate);
    const endMoment = moment(this.props.endDate);
    const indexMoment = startMoment.clone();
    while (!indexMoment.isAfter(endMoment, 'day')) {
      this.dates.push(indexMoment.clone());
      this.dateOptions.push({label: indexMoment.format('M月D号'), value: indexMoment.format('YYYY/MM/DD')});
      indexMoment.add(1, 'day');
    }
  }
  
  public render() {
    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };

    return (
      <Form>
        <span style={{fontSize: '48px', fontWeight: 'bolder'}}>会议注册</span>
        <FormItem {...formItemLayout} label="识别号">
          {getFieldDecorator('taxPayerId', {
            rules: [{ required: true, message: '请填写纳税人识别号' }],
          })(
            <Input placeholder="纳税人识别号" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="发票抬头">
          {getFieldDecorator('invoiceTitle', {
            rules: [{ required: true, message: '请填写发票抬头' }],
          })(
            <Input placeholder="抬头" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="电话号码">
          {getFieldDecorator('phone', {
            rules: [{ required: true, message: '请填写电话号码' }],
          })(
            <Input placeholder="电话号码" />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="到达时间">
          {getFieldDecorator('forecastArriveTime', {
          })(
            <Input placeholder="预计到达时间" />
          )}
        </FormItem>
        {
          this.props.stayTypes && this.props.stayTypes.length ?
          <FormItem {...formItemLayout} label="住宿类型">
            {getFieldDecorator('stayType', {
              rules: [{ required: true, message: '请选择住宿类型' }]
            })(
              <RadioGroup onChange={this.stayTypesChangeHandler}>
                {this.props.stayTypes.map((type, index) =>
                <Radio value={type} key={index}>{type}</Radio>)}
              </RadioGroup>
            )}
          </FormItem> : null
        }
        {
          this.props.stayTypes && this.props.stayTypes.length ?
          <FormItem {...formItemLayout} label="住宿日期">
            {getFieldDecorator('stayDates', {
              rules: [{required: this.state.stay, message: '请至少选择一个日期'}]
            })(
              <CheckboxGroup options={this.dateOptions}/>
            )}
          </FormItem> : null
        }
        <FormItem {...formItemLayout} label="备注">
          {getFieldDecorator('remarks')(
            <Input placeholder="备注" />
          )}
        </FormItem>
        <Button htmlType="submit" type="primary" onClick={this.submitHandler} style={{width: '100%'}}>注册</Button>
      </Form>
    );
  }

  private stayTypesChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '不住宿') {
      this.setState({stay: false});
    }
  }

  private submitHandler = (event: any) => {
    event.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (errors) {
        return;
      }
      HttpRequestDelegate.postJson(
        Urls.registerMeeting,
        {
          meetingId: this.props.meetingId,
          ...values
        },
        true,
        (data) => {
          if (data.code === ResponseCode.SUCCESS) {
            message.success('成功注册，等待管理员审批');
          } else if (data.code === ResponseCode.UNLOGIN) {
            UserService.requireLogin();
          } else if (data.code === ResponseCode.DUPLICATE_KEY) {
            message.warn('您已经注册过该会议');
          }
        }
      );
    });
  }
}

const MeetingRegister = Form.create()(MeetingRegisterForm);

export = MeetingRegister;
