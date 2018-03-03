import * as React from 'react';
import { Form, Input, Button, Col, DatePicker, Cascader, Row, Icon, Spin, message } from 'antd';
import { Meeting, ResponseCode } from '../../interface';
import HttpRequestDelegate from '../../http-request-delegate';
import Urls from '../../urls';
import UserService from '../user/user-service';
import BraftEditor from 'braft-editor';
import FormItem from 'antd/lib/form/FormItem';
import { FormComponentProps } from 'antd/lib/form';
import * as moment from 'moment';
import * as Styles from './meeting-manage.css';

interface Option {
  label: string;
  value: string;
  children?: Option[];
}

interface Props extends FormComponentProps {
  params: {
    meetingId: string;
  };
}

interface State {
  loading: boolean;
  changing: boolean;
  meeting?: Meeting;
  cities: Option[];
}

class MeetingManageForm extends React.Component<Props, State> {
  private guestNameFormItems: FormItem[];

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      changing: false,
      cities: []
    };
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.setState({loading: true});
    HttpRequestDelegate.get(
      Urls.dataForMeetingManage(nextProps.params.meetingId),
      true,
      (data) => {
        this.setState({
          cities: data.cities,
          loading: false,
          meeting: data.item
        });
      }
    );
  }

  public render() {
    if (this.state.loading) {
      return (
        <div
          className="container container-large"
          style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px'}}
        >
          <Spin size="large"/>
        </div>
      );
    }

    if (!this.state.meeting) {
      return <h2>没有此会议</h2>;
    }

    this.guestNameFormItems = [];

    const meeting = this.state.meeting as Meeting;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 21 },
      },
    };

    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 21,
          offset: 3,
        },
      },
    };

    const editorProps = {
      controls: [
        'undo', 'redo', 'split', 'font-size', 'font-family', 'text-color',
        'bold', 'italic', 'underline', 'strike-through', 'superscript',
        'subscript', 'text-align', 'split', 'headings', 'list_ul', 'list_ol'
      ],
      height: 250,
      contentFormat: 'html'
    };
    return (
      <Form>
        <FormItem {...formItemLayout} label="会议名">
          {getFieldDecorator('name', {
            rules: [{
              required: true, message: '请输入会议名称',
            }],
            initialValue: meeting.name
          })(
            <Input />
          )}
        </FormItem>
        <FormItem {...formItemLayout} label="时间" required={true}>
          <Col span={11}>
            <FormItem>
              {getFieldDecorator('startDate', {
                rules: [{
                  required: true, message: '请选择会议开始日期',
                }],
                initialValue: moment(meeting.startDate)
              })(
                <DatePicker placeholder="开始日期" style={{width: '100%'}}/>
              )}
            </FormItem>
          </Col>
          <Col span={2}>
          <span style={{ display: 'inline-block', width: '100%', textAlign: 'center' }}>
            -
          </span>
          </Col>
          <Col span={11}>
            <FormItem>
              {getFieldDecorator('endDate', {
                rules: [{
                  required: true, message: '请选择会议结束日期',
                }],
                initialValue: moment(meeting.endDate)
              })(
                <DatePicker placeholder="结束日期" style={{width: '100%'}}/>
              )}
            </FormItem>
          </Col>
        </FormItem>
        <FormItem {...formItemLayout} label="地点" required={true}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem style={{marginBottom: '0'}}>
                {getFieldDecorator('city', {
                  rules: [{required: true, message: '请选择省市'}],
                  initialValue: [meeting.location.province, meeting.location.city]
                })(
                  <Cascader options={this.state.cities} placeholder="省/市"/>
                )}
              </FormItem>
            </Col>
            <Col span={16}>
              <FormItem>
                {getFieldDecorator('address', {
                  rules: [{required: true, message: '请输入详细地址'}],
                  initialValue: meeting.location.address
                })(
                  <Input placeholder="详细地址"/>
                )}
              </FormItem>
            </Col>
          </Row>
        </FormItem>
        <FormItem {...formItemLayout} label="介绍">
          <div style={{border: '1px solid #dcdcdc'}}>
            <BraftEditor
              {...editorProps}
              placeholder="在此编辑会议介绍"
              initialContent={meeting.description}
              onChange={this.descriptionChangeHandler}
            />
          </div>
        </FormItem>
        <FormItem {...formItemLayout} label="嘉宾">
          <Button icon="plus" type="primary" onClick={() => this.addGuest()}>添加</Button>
          {meeting.guests.map((guest, index) =>
            <Row gutter={16} key={index} style={{marginBottom: '24px'}}>
              <Col span={4}>
                <FormItem
                  ref={(e) => this.guestNameFormItems.push(e as FormItem)}
                  validateStatus={guest.valid === false ? 'error' : 'success'}
                  help={guest.valid === false ? '请输入嘉宾名' : ''}
                >
                  <Input placeholder="姓名" value={guest.name} onChange={(e) => this.guestNameChangeHandler(e.target.value, index)}/>
                </FormItem>
              </Col>
              <Col span={18}>
                <FormItem>
                  <Input placeholder="介绍" value={guest.description} onChange={(e) => this.guestDescriptionChangeHandler(e.target.value, index)}/>
                </FormItem>
              </Col>
              <Col span={2}>
                <Icon type="minus-circle-o" className={Styles.icon} onClick={() => this.deleteGuest(index)}/>
              </Col>
            </Row>
          )}
        </FormItem>
        <FormItem label="注意事项" {...formItemLayout}>
          <div style={{border: '1px solid #dcdcdc'}}>
            <BraftEditor
              {...editorProps}
              placeholder="在此编辑注意事项，如会议详细时间、签到、费用等说明"
              initialContent={meeting.detail}
              onChange={this.detailChangeHandler}
            />
          </div>
        </FormItem>
        <FormItem {...tailFormItemLayout}>
          <Button
            loading={this.state.changing}
            type="primary"
            htmlType="submit"
            style={{width: '100%'}}
            onClick={this.submitHandler}
          >更改
          </Button>
        </FormItem>
      </Form>
    );
  }

  private descriptionChangeHandler = (s: string) => {
    const meeting = this.state.meeting as Meeting;
    meeting.description = s;
    this.setState({meeting});
  }

  private detailChangeHandler = (s: string) => {
    const meeting = this.state.meeting  as Meeting;
    meeting.detail = s;
    this.setState({meeting});
  }

  private addGuest = () => {
    const meeting = this.state.meeting as Meeting;
    const guests = meeting.guests;
    guests.push({name: '', description: '', randomId: Math.random(), valid: true});
    this.setState({meeting});
  }

  private deleteGuest = (index: number) => {
    const meeting = this.state.meeting as Meeting;
    const guests = meeting.guests;
    guests.splice(index, 1);
    this.setState({meeting});
  }

  private guestNameChangeHandler = (name: string, index: number) => {
    const meeting = this.state.meeting as Meeting;
    const guests = meeting.guests;
    guests[index].valid = !!name;
    guests[index].name = name;
    this.setState({meeting});
  }

  private guestDescriptionChangeHandler = (description: string, index: number) => {
    const meeting = this.state.meeting as Meeting;
    const guests = meeting.guests;
    guests[index].description =  description;
    this.setState({meeting});
  }

  private submitHandler = (e: any) => {
    e.preventDefault();
    const meeting = this.state.meeting as Meeting;
    this.props.form.validateFieldsAndScroll(undefined, {}, (errors, values) => {
      if (!errors) {
        this.setState({changing: true});
        HttpRequestDelegate.postJson(
          Urls.editMeeting(this.props.params.meetingId),
          {
            ...values,
            location: {
              province: values.city[0],
              city: values.city[1],
              address: values.address
            },
            description: meeting.description,
            detail: meeting.detail,
            guests: meeting.guests.map((guest) => ({name: guest.name, description: guest.description}))
          },
          true,
          (data) => {
            this.setState({changing: false});
            if (data.code === ResponseCode.SUCCESS) {
              message.success('更改成功');
            } else if (data.code === ResponseCode.SUCCESS) {
              UserService.requireLogin();
            }
          }
        );
      }
    });
  }
}

const MeetingManage = Form.create()(MeetingManageForm);

export default MeetingManage;
