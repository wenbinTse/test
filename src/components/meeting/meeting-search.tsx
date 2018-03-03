import * as React from 'react';
import { Input, Row, Col } from 'antd';
const Search = Input.Search;

interface Props {
  onSearch: (keyword: string) => void;
}

class MeetingSearch extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
  }

  public render() {
    return (
      <Row>
        <Col sm={12} md={18} lg={12}>
          <Search
            style={{margin: '16px 0'}}
            placeholder="会议关键字"
            onSearch={this.props.onSearch}
            enterButton="搜索"
            size="large"
          />
        </Col>
      </Row>
    );
  }
}

export default MeetingSearch;
